// Tank Page JS for PCWStats
document.addEventListener('DOMContentLoaded', function() {
    // Get tank ID from meta tag
    const tankIdMeta = document.querySelector('meta[name="tank-id"]');
    const tankId = tankIdMeta ? tankIdMeta.content : null;

    // If tank ID is specified, fetch and populate tank data
    if (tankId) {
        fetchTankData(tankId);
    }

    // Initialize gamemode selector functionality
    const gamemodeButtons = document.querySelectorAll('.gamemode-btn');
    const gamemodeSections = document.querySelectorAll('.gamemode-section');

    // Set up click handlers for gamemode buttons
    gamemodeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            gamemodeButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Get the gamemode to show
            const gamemode = this.dataset.gamemode;

            // Hide all gamemode sections
            gamemodeSections.forEach(section => {
                section.classList.remove('active');
            });

            // Show the selected gamemode section
            document.getElementById(gamemode).classList.add('active');

            // Update URL hash if needed
            window.location.hash = gamemode;
        });
    });

    // Check for hash on page load to set initial gamemode
    if (window.location.hash) {
        const initialGamemode = window.location.hash.substring(1);
        const initialButton = document.querySelector(`.gamemode-btn[data-gamemode="${initialGamemode}"]`);

        if (initialButton) {
            initialButton.click();
        }
    }

    // Initialize agent modals
    initializeAgentModals();

    // Initialize any interactive elements specific to tank pages
    initializeTankPageElements();
});

// Function to fetch tank data based on ID
async function fetchTankData(tankId) {
    try {
        // First fetch the tanks.json to get the tank details
        const tanksResponse = await fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/tanks.json');
        const tanksData = await tanksResponse.json();

        // Find the tank with matching ID
        const tank = tanksData.find(t => t.id.toString() === tankId.toString());

        if (!tank) {
            console.error('Tank not found with ID:', tankId);
            return;
        }

        // Update page elements with tank data
        updateTankPageElements(tank);

        // Fetch and populate agents data if available
        if (tank.agents) {
            await fetchAndPopulateAgents(tank.agents, tank.id);
        }

        // Fetch stock data if available
        if (tank.stock) {
            await fetchAndPopulateStockData(tank.stock, tank.id, tank.slug);
        }

    } catch (error) {
        console.error('Error fetching tank data:', error);
    }
}

async function fetchAndPopulateStockData(stockUrl, tankId, tankSlug) {
    try {
        const stockResponse = await fetch(stockUrl);
        const stockData = await stockResponse.json();

        console.log('Stock data loaded:', stockData);

        // Try different ways to find the tank stats
        let tankStats;

        // Try by exact ID match first
        if (stockData[tankId]) {
            tankStats = stockData[tankId];
        }
        // Try by slug if ID didn't work
        else if (tankSlug && stockData[tankSlug]) {
            tankStats = stockData[tankSlug];
        }
        // Try case-insensitive ID match
        else {
            const tankKey = Object.keys(stockData).find(key =>
                key.toLowerCase() === tankId.toString().toLowerCase() ||
                (tankSlug && key.toLowerCase() === tankSlug.toLowerCase())
            );

            if (tankKey) {
                tankStats = stockData[tankKey];
            }
        }

        if (tankStats) {
            console.log('Found tank stats:', tankStats);
            populateTankStats(tankStats);

            // Calculate and display GSS scores
            calculateAndDisplayGSS(tankStats, tankId);
        } else {
            console.error('No stats found for tank:', {
                id: tankId,
                slug: tankSlug,
                availableKeys: Object.keys(stockData)
            });
        }
    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
}

async function calculateAndDisplayGSS(currentTankStats, currentTankId) {
    try {
        // First fetch all tanks data
        const tanksResponse = await fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/tanks.json');
        const tanksData = await tanksResponse.json();

        // Then fetch all stock data for comparison
        const allStockData = {};
        const stockPromises = tanksData.map(async tank => {
            try {
                const response = await fetch(tank.stock);
                const data = await response.json();
                // Try different ways to get the stats for this tank
                const tankStats = data[tank.id] || data[tank.slug] || Object.values(data)[0];
                if (tankStats) {
                    allStockData[tank.id] = tankStats;
                }
            } catch (error) {
                console.error(`Error fetching stock data for tank ${tank.id}:`, error);
            }
        });

        await Promise.all(stockPromises);

        // Filter out unreleased tanks (all stats = 0)
        const validTanks = {};
        for (const [tankId, stats] of Object.entries(allStockData)) {
            if (!isUnreleasedTank(stats)) {
                validTanks[tankId] = stats;
            }
        }

        // If no valid tanks to compare with, set all scores to 0
        if (Object.keys(validTanks).length === 0) {
            updateGSSScores({
                FIREPOWER: 0,
                SURVIVABILITY: 0,
                MOBILITY: 0,
                RECON: 0,
                UTILITY: 0
            });
            return;
        }

        // Calculate GSS for each category
        const gssScores = {
            FIREPOWER: calculateCategoryGSS(currentTankStats.FIREPOWER, validTanks, 'FIREPOWER'),
            SURVIVABILITY: calculateCategoryGSS(currentTankStats.SURVIVABILITY, validTanks, 'SURVIVABILITY'),
            MOBILITY: calculateCategoryGSS(currentTankStats.MOBILITY, validTanks, 'MOBILITY'),
            RECON: calculateCategoryGSS(currentTankStats.RECON, validTanks, 'RECON'),
            UTILITY: calculateCategoryGSS(currentTankStats.UTILITY, validTanks, 'UTILITY')
        };

        // Update the GSS scores in the UI
        updateGSSScores(gssScores);

    } catch (error) {
        console.error('Error calculating GSS:', error);
        // Set all scores to 0 if there's an error
        updateGSSScores({
            FIREPOWER: 0,
            SURVIVABILITY: 0,
            MOBILITY: 0,
            RECON: 0,
            UTILITY: 0
        });
    }
}

function isUnreleasedTank(stats) {
    // Check if all stats are 0 (unreleased tank)
    if (!stats) return true;

    for (const category in stats) {
        for (const stat in stats[category]) {
            const value = parseFloat(stats[category][stat]);
            if (value !== 0 && !isNaN(value)) {
                return false;
            }
        }
    }
    return true;
}

function calculateCategoryGSS(currentCategoryStats, allTanksStats, categoryName) {
    if (!currentCategoryStats) return 0;

    // Collect all values for each stat in this category across all tanks
    const statValues = {};

    // Initialize statValues with current tank's stats
    for (const stat in currentCategoryStats) {
        statValues[stat] = [];
    }

    // Add stats from all other tanks
    for (const tankId in allTanksStats) {
        const tankStats = allTanksStats[tankId];
        if (tankStats && tankStats[categoryName]) {
            for (const stat in currentCategoryStats) {
                if (tankStats[categoryName][stat] !== undefined) {
                    const value = parseFloat(tankStats[categoryName][stat]);
                    if (!isNaN(value)) {
                        statValues[stat].push(value);
                    }
                }
            }
        }
    }

    // Calculate normalized scores for each stat (0-1000)
    const normalizedScores = {};
    for (const stat in statValues) {
        const values = statValues[stat];
        if (values.length === 0) continue;

        const currentValue = parseFloat(currentCategoryStats[stat]);
        if (isNaN(currentValue)) continue;

        const min = Math.min(...values);
        const max = Math.max(...values);

        // Handle case where all values are the same
        if (min === max) {
            normalizedScores[stat] = 500; // Average score if all values are equal
        } else {
            // Calculate normalized score (0-1000)
            normalizedScores[stat] = Math.round(((currentValue - min) / (max - min)) * 1000);
            // Ensure score is within bounds
            normalizedScores[stat] = Math.max(0, Math.min(1000, normalizedScores[stat]));
        }
    }

    // Calculate average score for the category
    const statCount = Object.keys(normalizedScores).length;
    if (statCount === 0) return 0;

    const sum = Object.values(normalizedScores).reduce((a, b) => a + b, 0);
    return Math.round(sum / statCount);
}

function updateGSSScores(gssScores) {
    // Get all stat categories in the DOM
    const statCategories = document.querySelectorAll('.stats-category');

    statCategories.forEach(category => {
        const header = category.querySelector('h3');
        if (!header) return;

        const categoryName = header.textContent.trim().toUpperCase();
        const scoreElement = category.querySelector('.score');

        if (scoreElement && gssScores[categoryName] !== undefined) {
            const score = gssScores[categoryName];
            scoreElement.textContent = score;

            // Add color coding based on score (not implemented)
            if (score >= 750) {
                scoreElement.style.color = '#e0e0e0'; // Green for high scores
            } else if (score >= 500) {
                scoreElement.style.color = '#e0e0e0'; // Yellow for medium-high scores
            } else if (score >= 250) {
                scoreElement.style.color = '#e0e0e0'; // Orange for medium-low scores
            } else {
                scoreElement.style.color = '#e0e0e0'; // Red for low scores
            }
        }
    });
}

async function fetchAndPopulateAgents(agentsUrl, tankId) {
    try {
        const agentsResponse = await fetch(agentsUrl);
        const agentsData = await agentsResponse.json();

        if (agentsData && agentsData.agents && agentsData.agents.length > 0) {
            populateAgents(agentsData.agents);

            // Update agent count in header
            const agentCountSpan = document.querySelector('.tank-header .tank-meta span:nth-child(3)');
            if (agentCountSpan) {
                agentCountSpan.innerHTML = `<i class="fas fa-users mr-1"></i> ${agentsData.agents.length} Agents`;
            }

            // Reinitialize agent modals after populating agents
            initializeAgentModals();
        } else {
            console.warn('No agents data found in:', agentsUrl);
        }
    } catch (error) {
        console.error('Error fetching agents data:', error);
    }
}

function populateAgents(agents) {
    // Look for the container by its ID instead of using the adjacent selector
    const agentsContainer = document.getElementById('agents-container');
    if (!agentsContainer) {
        console.error('Agents container not found');
        return;
    }

    // Clear existing content
    agentsContainer.innerHTML = '';

    // Create agent cards for each agent
    agents.forEach(agent => {
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';

        agentCard.innerHTML = `
            <div class="agent-image">
                <img src="${agent.image}" alt="${agent.name}">
            </div>
            <div class="agent-info">
                <h3>${agent.name}</h3>
                <p class="agent-specialty">${agent.specialty}</p>
                <p class="agent-description">${agent.description}</p>
            </div>
        `;

        agentsContainer.appendChild(agentCard);
    });
}

function updateTankPageElements(tank) {
    // Update page title and meta tags
    document.title = `${tank.name} - PCWStats`;
    document.querySelector('meta[property="og:title"]').content = `PCWStats - ${tank.name}`;
    document.querySelector('meta[name="twitter:title"]').content = `PCWStats - ${tank.name}`;

    // Update tank header information
    const tankHeader = document.querySelector('.tank-header');
    if (tankHeader) {
        const typeBadge = tankHeader.querySelector('.tank-type-badge');
        if (typeBadge && tank.type !== "Unknown") {
            typeBadge.textContent = tank.type;
        }

        const nationSpan = tankHeader.querySelector('.tank-meta span:nth-child(2)');
        if (nationSpan) {
            nationSpan.innerHTML = `<i class="fas fa-flag mr-1"></i> ${tank.nation}`;
        }

        const tankTitle = tankHeader.querySelector('.tank-title');
        if (tankTitle) {
            tankTitle.textContent = tank.name;
        }
    }

    // Update tank image
    const tankImage = document.querySelector('.tank-image img');
    if (tankImage) {
        tankImage.src = tank.image;
        tankImage.alt = tank.name;
    }
}

function initializeAgentModals() {
    // Agent modal elements
    const agentModal = document.getElementById('agentModal');
    const agentModalOverlay = document.getElementById('agentModalOverlay');
    const agentModalClose = document.getElementById('agentModalClose');
    const agentModalImage = document.getElementById('agentModalImage');
    const agentModalName = document.getElementById('agentModalName');
    const agentModalSpecialty = document.getElementById('agentModalSpecialty');
    const agentModalDescription = document.getElementById('agentModalDescription');
    const agentModalStory = document.getElementById('agentModalStory');
    const agentModalTanksContainer = document.getElementById('agentModalTanksContainer');

    // Set up click handlers for all agent cards
    document.querySelectorAll('.agent-card').forEach(card => {
        card.addEventListener('click', async function() {
            const agentName = this.querySelector('h3').textContent;

            // Get the tank ID to fetch the correct agents.json
            const tankIdMeta = document.querySelector('meta[name="tank-id"]');
            const tankId = tankIdMeta ? tankIdMeta.content : null;

            if (!tankId) {
                console.error('No tank ID found');
                return;
            }

            try {
                // First get the tank data to find the agents URL
                const tanksResponse = await fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/tanks.json');
                const tanksData = await tanksResponse.json();
                const tank = tanksData.find(t => t.id.toString() === tankId.toString());

                if (!tank || !tank.agents) {
                    console.error('Tank or agents URL not found');
                    return;
                }

                // Fetch the agents data
                const agentsResponse = await fetch(tank.agents);
                const agentsData = await agentsResponse.json();

                // Find the clicked agent
                const agent = agentsData.agents.find(a => a.name === agentName);

                if (!agent) {
                    console.error('Agent not found:', agentName);
                    return;
                }

                // Populate modal with agent data
                agentModalImage.src = agent.image;
                agentModalImage.alt = agentName;
                agentModalName.textContent = agentName;
                agentModalSpecialty.textContent = agent.specialty;
                agentModalDescription.textContent = agent.description;
                agentModalStory.textContent = agent.story;

                // Clear previous tank images
                agentModalTanksContainer.innerHTML = '';

                // Add compatible tanks
                if (agent.compatibleTanks && agent.compatibleTanks.length > 0) {
                    agent.compatibleTanks.forEach(tank => {
                        const tankElement = document.createElement('div');
                        tankElement.className = 'agent-modal-tank';

                        const tankImg = document.createElement('img');
                        tankImg.src = tank.image;
                        tankImg.alt = tank.name;

                        const tankName = document.createElement('span');
                        tankName.textContent = tank.name;

                        tankElement.appendChild(tankImg);
                        tankElement.appendChild(tankName);
                        agentModalTanksContainer.appendChild(tankElement);
                    });
                }

                // Show modal
                agentModal.classList.add('active');
                agentModalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';

            } catch (error) {
                console.error('Error loading agent data:', error);
            }
        });
    });

    // Close modal handlers
    agentModalOverlay.addEventListener('click', closeAgentModal);
    agentModalClose.addEventListener('click', closeAgentModal);

    // Close with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && agentModal.classList.contains('active')) {
            closeAgentModal();
        }
    });

    function closeAgentModal() {
        agentModal.classList.remove('active');
        agentModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Function to populate tank stats from stock data
function populateTankStats(tankStats) {
    // Helper function to update stat values
    function updateStat(category, statName, value) {
        // Find all stat categories
        const categories = document.querySelectorAll('.stats-category');

        // Find the matching category
        let targetCategory = null;
        categories.forEach(cat => {
            const h3 = cat.querySelector('h3');
            if (h3 && h3.textContent.includes(category)) {
                targetCategory = cat;
            }
        });

        if (!targetCategory) return;

        // Find all stat items in this category
        const statItems = targetCategory.querySelectorAll('.stat-item');

        // Find the matching stat item
        let targetItem = null;
        statItems.forEach(item => {
            const nameElement = item.querySelector('.stat-name');
            if (nameElement && nameElement.textContent.includes(statName)) {
                targetItem = item;
            }
        });

        if (!targetItem) return;

        // Update the value
        const valueElement = targetItem.querySelector('.stat-value');
        if (valueElement) {
            valueElement.textContent = value;
        }
    }

    // Firepower stats
    if (tankStats.FIREPOWER) {
        const fp = tankStats.FIREPOWER;
        updateStat('Firepower', 'Damage', fp.DAMAGE);
        updateStat('Firepower', 'Penetration', fp.PENETRATION);
        updateStat('Firepower', 'Aiming Speed', fp["AIMING SPEED"]);
        updateStat('Firepower', 'Reload Time', fp["RELOAD TIME"]);
        updateStat('Firepower', 'Time Between Shots', fp["TIME BETWEEN SHOTS"]);
        updateStat('Firepower', 'Shells in Magazine', fp["SHELLS IN MAGAZINE"]);
        updateStat('Firepower', 'Magazine Count', fp["MAGAZINE COUNT"]);
        updateStat('Firepower', 'Time to Load Next Magazine', fp["TIME TO LOAD NEXT MAGAZINE"]);
        updateStat('Firepower', 'Reticle Size, Moving', fp["RETICLE SIZE, MOVING"]);
        updateStat('Firepower', 'Reticle Size, Rotating Hull', fp["RETICLE SIZE, ROTATING HULL"]);
        updateStat('Firepower', 'Reticle Size, Standing', fp["RETICLE SIZE, STANDING"]);
        updateStat('Firepower', 'Reticle Size, After Shot', fp["RETICLE SIZE, AFTER SHOT"]);
        updateStat('Firepower', 'Reticle Size, Max', fp["RETICLE SIZE, MAX"]);
        updateStat('Firepower', 'Turret Traverse Speed, Degrees/Second', fp["TURRET TRAVERSE SPEED"]);
        updateStat('Firepower', 'Gun Elevation Speed, Degrees/Second', fp["GUN ELEVATION, DEGREES/SECOND"]);
        updateStat('Firepower', 'Gun Depression (Front)', fp["GUN DEPRESSION, FRONT"]);
        updateStat('Firepower', 'Gun Depression (Side)', fp["GUN DEPRESSION, SIDE"]);
        updateStat('Firepower', 'Gun Depression (Rear)', fp["GUN DEPRESSION, REAR"]);
        updateStat('Firepower', 'Gun Elevation (Front)', fp["GUN ELEVATION, FRONT"]);
        updateStat('Firepower', 'Gun Elevation (Side)', fp["GUN ELEVATION, SIDE"]);
        updateStat('Firepower', 'Gun Elevation (Rear)', fp["GUN ELEVATION, REAR"]);
    }

    // Survivability stats
    if (tankStats.SURVIVABILITY) {
        const surv = tankStats.SURVIVABILITY;
        updateStat('Survivability', 'Hit Points', surv["HIT POINTS"]);
        updateStat('Survivability', 'Incoming Crit Damage, Ammo Rack', surv["INCOMING CRIT DAMAGE, AMMO RACK"]);
        updateStat('Survivability', 'Track Repair Time, Seconds', surv["TRACK REPAIR TIME, SECONDS"]);
        updateStat('Survivability', 'Crew Hit Points', surv["CREW HIT POINTS"]);
        updateStat('Survivability', 'Crew Recovery Time, Seconds', surv["CREW RECOVERY TIME, SECONDS"]);
        updateStat('Survivability', 'Incoming Crit Damage, Engine', surv["INCOMING CRIT DAMAGE, ENGINE"]);
        updateStat('Survivability', 'Engine Hit Points', surv["ENGINE HIT POINTS"]);
        updateStat('Survivability', 'Engine Repair Time, Seconds', surv["ENGINE REPAIR TIME, SECONDS"]);
        updateStat('Survivability', 'Fire Duration, Seconds', surv["FIRE DURATION, SECONDS"]);
        updateStat('Survivability', 'Fire Damage', surv["FIRE DAMAGE"]);
        updateStat('Survivability', 'Incoming Crit Damage, Fuel Tank', surv["INCOMING CRIT DAMAGE, FUEL TANK"]);
        updateStat('Survivability', 'Fire Damage Rate', surv["FIRE DAMAGE RATE"]);
        updateStat('Survivability', 'Ramming Damage Resistance, Front', surv["RAMMING DAMAGE RESISTANCE, FRONT"]);
        updateStat('Survivability', 'Ramming Damage Bonus', surv["RAMMING DAMAGE BONUS"]);
        updateStat('Survivability', 'Repair Kit Cooldown, Seconds', surv["REPAIR KIT COOLDOWN, SECONDS"]);
        updateStat('Survivability', 'Track Hit Points', surv["TRACK HIT POINTS"]);
        updateStat('Survivability', 'Ltrackamounttoregen', surv["LTRACKAMOUNTTOREGEN"]);
    }

    // Mobility stats
    if (tankStats.MOBILITY) {
        const mob = tankStats.MOBILITY;
        updateStat('Mobility', 'Forward Speed, km/h', mob["FORWARD SPEED, KM/H"]);
        updateStat('Mobility', 'Reverse Speed, km/h', mob["REVERSE SPEED, KM/H"]);
        updateStat('Mobility', 'Base Acceleration', mob["BASE ACCELERATION"]);
        updateStat('Mobility', 'Traverse Speed', mob["TRAVERSE SPEED"]);
        updateStat('Mobility', 'Sprint Energy Cost', mob["SPRINT ENERGY COST"]);
        updateStat('Mobility', 'Sprint Energy Volume', mob["SPRINT ENERGY VOLUME"]);
        updateStat('Mobility', 'Sprint Regen Rate', mob["SPRINT REGEN RATE"]);
        updateStat('Mobility', 'Ramming Mass Measure', mob["RAMMING MASS MEASURE"]);
    }

    // Recon stats
    if (tankStats.RECON) {
        const recon = tankStats.RECON;
        updateStat('Recon', 'Spotting Angle, Degrees', recon["SPOTTING ANGLE, DEGREES"]);
        updateStat('Recon', 'Spotting Range, Meters', recon["SPOTTING RANGE, METERS"]);
        updateStat('Recon', 'Spotting Duration, Seconds', recon["SPOTTING DURATION, SECONDS"]);
        updateStat('Recon', 'Signal Range, Meters', recon["SIGNAL RANGE, METERS"]);
        updateStat('Recon', 'X-Ray Radius, Meters', recon["X-RAY RADIUS, METERS"]);
    }

    // Utility stats
    if (tankStats.UTILITY) {
        const util = tankStats.UTILITY;
        updateStat('Utility', 'Energy Points', util["ENERGY POINTS"]);
        updateStat('Utility', 'Energy Regeneration', util["ENERGY REGENERATION"]);
        updateStat('Utility', 'Smoke Cooldown, Seconds', util["SMOKE COOLDOWN, SECONDS"]);
        updateStat('Utility', 'Smoke Energy Cost', util["SMOKE ENERGY COST"]);
        updateStat('Utility', 'Smoke Use Count', util["SMOKE USE COUNT"]);
    }
}

function initializeTankPageElements() {
    // Initialize image gallery
    initializeImageGallery();

    // FAQ Accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Add intersection observer for animated elements if needed
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe any elements that need to animate in
        document.querySelectorAll('.map-image, .sidebar-card').forEach(el => {
            observer.observe(el);
        });
    }
}

function initializeImageGallery() {
    const galleryModal = document.getElementById('galleryModal');
    const galleryMainImage = document.getElementById('galleryMainImage');
    const galleryImageCaption = document.getElementById('galleryImageCaption');
    const galleryThumbnailsContainer = document.getElementById('galleryThumbnailsContainer');
    const galleryCloseBtn = document.getElementById('galleryCloseBtn');
    const galleryPrevBtn = document.getElementById('galleryPrevBtn');
    const galleryNextBtn = document.getElementById('galleryNextBtn');

    // Collect all images from the page that should be in the gallery
    const galleryImages = [];

    // Add main content images
    document.querySelectorAll('.map-image img').forEach(img => {
        galleryImages.push({
            src: img.src,
            alt: img.alt,
            caption: img.nextElementSibling?.textContent || ''
        });
    });

    // Add sidebar gallery images
    document.querySelectorAll('.sidebar-card .gallery-thumbnail img').forEach(img => {
        galleryImages.push({
            src: img.parentElement.href,
            alt: img.alt,
            caption: img.alt
        });
    });

    // If no images found, don't initialize the gallery
    if (galleryImages.length === 0) return;

    let currentImageIndex = 0;

    // Function to open the gallery at a specific index
    function openGallery(index) {
        if (index < 0 || index >= galleryImages.length) return;

        currentImageIndex = index;
        updateGalleryImage();
        galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Function to update the gallery with current image
    function updateGalleryImage() {
        const currentImage = galleryImages[currentImageIndex];
        galleryMainImage.src = currentImage.src;
        galleryMainImage.alt = currentImage.alt;
        galleryImageCaption.textContent = currentImage.caption;

        // Update active thumbnail
        document.querySelectorAll('.gallery-thumbnail-item').forEach((thumb, idx) => {
            thumb.classList.toggle('active', idx === currentImageIndex);
        });

        // Scroll thumbnails to show active one
        const activeThumb = document.querySelector('.gallery-thumbnail-item.active');
        if (activeThumb) {
            activeThumb.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }

    // Function to close the gallery
    function closeGallery() {
        galleryModal.classList.remove('active');
        document.body.style.overflow = '';
        galleryMainImage.classList.remove('zoomed');
    }

    // Create thumbnail items
    function createThumbnails() {
        galleryThumbnailsContainer.innerHTML = '';
        galleryImages.forEach((img, index) => {
            const thumbItem = document.createElement('div');
            thumbItem.className = 'gallery-thumbnail-item';
            if (index === currentImageIndex) thumbItem.classList.add('active');

            const thumbImg = document.createElement('img');
            thumbImg.src = img.src;
            thumbImg.alt = img.alt;

            thumbItem.appendChild(thumbImg);
            thumbItem.addEventListener('click', () => {
                currentImageIndex = index;
                updateGalleryImage();
            });

            galleryThumbnailsContainer.appendChild(thumbItem);
        });
    }

    // Initialize thumbnails
    createThumbnails();

    // Set up click handlers for all gallery images
    document.querySelectorAll('.map-image img, .sidebar-card .gallery-thumbnail').forEach((element, index) => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            openGallery(index);
        });
    });

    // Navigation buttons
    galleryPrevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateGalleryImage();
    });

    galleryNextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateGalleryImage();
    });

    // Close button
    galleryCloseBtn.addEventListener('click', closeGallery);

    // Close when clicking outside the image
    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            closeGallery();
        }
    });

    // Zoom functionality
    galleryMainImage.addEventListener('click', () => {
        galleryMainImage.classList.toggle('zoomed');
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!galleryModal.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeGallery();
                break;
            case 'ArrowLeft':
                currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
                updateGalleryImage();
                break;
            case 'ArrowRight':
                currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
                updateGalleryImage();
                break;
        }
    });

    // Swipe support for touch devices
    let touchStartX = 0;
    let touchEndX = 0;

    galleryMainImage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, {
        passive: true
    });

    galleryMainImage.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {
        passive: true
    });

    function handleSwipe() {
        if (touchStartX - touchEndX > 50) {
            // Swipe left - next image
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            updateGalleryImage();
        } else if (touchEndX - touchStartX > 50) {
            // Swipe right - previous image
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            updateGalleryImage();
        }
    }
}