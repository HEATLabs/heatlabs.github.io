// Initialize variables
let allTanksData = [];
let currentTankId = null;
let currentTankType = 'Unknown';
let currentTankAgents = [];
let comparisonTanks = JSON.parse(localStorage.getItem('tankComparison')) || [];

// Tank Page JS for HEAT Labs
document.addEventListener('DOMContentLoaded', function() {
    // Get tank ID from meta tag
    const tankIdMeta = document.querySelector('meta[name="tank-id"]');
    const tankId = tankIdMeta ? tankIdMeta.content : null;

    // Fetch and display view count
    fetchViewCount().then(views => {
        displayViewCounter(views);
    });

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

    // Initialize comparison button
    initializeComparisonButton();
});

async function fetchViewCount() {
    try {
        // Get the tracking pixel URL from the meta tag
        const trackingPixel = document.querySelector('.heatlabs-tracking-pixel');
        if (!trackingPixel || !trackingPixel.src) {
            return {
                totalViews: 0
            };
        }

        // Extract the image filename from the tracking pixel URL
        const imageName = trackingPixel.src.split('/').pop();

        // Build the stats API URL
        const statsApiUrl = `https://views.heatlabs.net/api/stats?image=${imageName}`;
        const response = await fetch(statsApiUrl);

        if (!response.ok) {
            throw new Error('Failed to load view count');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading view count:', error);
        return {
            totalViews: 0
        }; // Return 0 if there's an error
    }
}

// Function to display view counter in the tank header
function displayViewCounter(views) {
    const tankMeta = document.querySelector('.tank-meta');
    if (tankMeta) {
        // Check if view counter already exists
        if (!tankMeta.querySelector('.map-views-counter')) {
            const viewCounter = document.createElement('span');
            viewCounter.className = 'map-views-counter';
            viewCounter.innerHTML = `
                <i class="fas fa-eye"></i>
                <span class="map-views-count">${views.totalViews.toLocaleString()}</span> views
            `;
            tankMeta.appendChild(viewCounter);
        }
    }
}

function isValidTankStats(stats) {
    if (!stats) return false;

    // Check each category for non-zero values
    const categories = ['FIREPOWER', 'MOBILITY', 'SURVIVABILITY', 'RECON', 'UTILITY'];
    return categories.some(category => {
        if (!stats[category]) return false;
        return Object.values(stats[category]).some(val => {
            const num = parseFloat(val);
            // Also check for negative values (like gun depression which shows as "-0")
            return !isNaN(num) && num !== 0;
        });
    });
}

// Function to fetch tank data based on ID
async function fetchTankData(tankId) {
    try {
        // First fetch the tanks.json to get the tank details
        const tanksResponse = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json');
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

        // Fetch abilities data if available
        if (tank.abilities) {
            await fetchAndPopulateAbilities(tank.abilities, tank.id);
        }

        // Fetch builds data if available
        if (tank.builds) {
            await fetchAndPopulateBuilds(tank.builds, tank.id);
        }

    } catch (error) {
        console.error('Error fetching tank data:', error);
    }
}

async function fetchAndPopulateAbilities(abilitiesUrl, tankId) {
    try {
        const abilitiesResponse = await fetch(abilitiesUrl);
        const abilitiesData = await abilitiesResponse.json();

        if (abilitiesData) {
            populateAbilities(abilitiesData);
            initializeAbilityModals();
        }
    } catch (error) {
        console.error('Error fetching abilities data:', error);
    }
}

function populateAbilities(abilitiesData) {
    const abilitiesContainer = document.getElementById('abilities-container');
    if (!abilitiesContainer) return;

    // Clear existing content
    abilitiesContainer.innerHTML = '';

    // Create cards for each ability type
    if (abilitiesData.agentAbility && abilitiesData.agentAbility.length > 0) {
        abilitiesData.agentAbility.forEach(ability => {
            abilitiesContainer.appendChild(createAbilityCard(ability, 'Agent Ability'));
        });
    }

    if (abilitiesData.primaryAttack && abilitiesData.primaryAttack.length > 0) {
        abilitiesData.primaryAttack.forEach(ability => {
            abilitiesContainer.appendChild(createAbilityCard(ability, 'Primary Attack'));
        });
    }

    if (abilitiesData.tankAbilities && abilitiesData.tankAbilities.length > 0) {
        abilitiesData.tankAbilities.forEach(ability => {
            abilitiesContainer.appendChild(createAbilityCard(ability, 'Tank Ability'));
        });
    }
}

function createAbilityCard(ability, type) {
    const abilityCard = document.createElement('div');
    abilityCard.className = 'ability-card';
    abilityCard.dataset.abilityName = ability.name;

    abilityCard.innerHTML = `
        <div class="ability-image">
            <img src="${ability.icon}" alt="${ability.name}" loading="lazy">
        </div>
        <div class="ability-info">
            <h3>${ability.name}</h3>
            <p>${type}</p>
        </div>
    `;

    return abilityCard;
}

function initializeAbilityModals() {
    // Create modal elements if they don't exist
    if (!document.getElementById('abilityModal')) {
        const abilityModal = document.createElement('div');
        abilityModal.className = 'ability-modal';
        abilityModal.id = 'abilityModal';
        abilityModal.innerHTML = `
            <button class="ability-modal-close" id="abilityModalClose">
                <i class="fas fa-times"></i>
            </button>
            <div class="ability-modal-content">
                <div class="ability-modal-header">
                    <div class="ability-modal-title">
                        <h2 id="abilityModalName"></h2>
                        <p id="abilityModalType"></p>
                    </div>
                </div>
                <div class="ability-modal-video" id="abilityModalVideo"></div>
                <div class="ability-modal-description" id="abilityModalDescription"></div>
            </div>
        `;

        const abilityModalOverlay = document.createElement('div');
        abilityModalOverlay.className = 'ability-modal-overlay';
        abilityModalOverlay.id = 'abilityModalOverlay';

        document.body.appendChild(abilityModalOverlay);
        document.body.appendChild(abilityModal);
    }

    // Set up click handlers for all ability cards
    document.querySelectorAll('.ability-card').forEach(card => {
        card.addEventListener('click', function() {
            const abilityName = this.dataset.abilityName;
            const tankIdMeta = document.querySelector('meta[name="tank-id"]');
            const tankId = tankIdMeta ? tankIdMeta.content : null;

            if (!tankId) {
                console.error('No tank ID found');
                return;
            }

            // Find the tank data to get abilities URL
            fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json')
                .then(response => response.json())
                .then(tanksData => {
                    const tank = tanksData.find(t => t.id.toString() === tankId.toString());
                    if (!tank || !tank.abilities) {
                        console.error('Tank or abilities URL not found');
                        return;
                    }

                    // Fetch the abilities data
                    return fetch(tank.abilities);
                })
                .then(response => response.json())
                .then(abilitiesData => {
                    // Find the clicked ability in any of the categories
                    let ability = null;
                    let abilityType = '';

                    // Check agent abilities
                    if (abilitiesData.agentAbility) {
                        const found = abilitiesData.agentAbility.find(a => a.name === abilityName);
                        if (found) {
                            ability = found;
                            abilityType = 'Agent Ability';
                        }
                    }

                    // Check primary attacks
                    if (!ability && abilitiesData.primaryAttack) {
                        const found = abilitiesData.primaryAttack.find(a => a.name === abilityName);
                        if (found) {
                            ability = found;
                            abilityType = 'Primary Attack';
                        }
                    }

                    // Check tank abilities
                    if (!ability && abilitiesData.tankAbilities) {
                        const found = abilitiesData.tankAbilities.find(a => a.name === abilityName);
                        if (found) {
                            ability = found;
                            abilityType = 'Tank Ability';
                        }
                    }

                    if (!ability) {
                        console.error('Ability not found:', abilityName);
                        return;
                    }

                    // Populate modal
                    document.getElementById('abilityModalName').textContent = ability.name;
                    document.getElementById('abilityModalType').textContent = abilityType;
                    document.getElementById('abilityModalDescription').textContent = ability.description;

                    // Set up video if available
                    const videoContainer = document.getElementById('abilityModalVideo');
                    videoContainer.innerHTML = '';

                    if (ability.video) {
                        if (ability.video.includes('youtube') || ability.video.includes('youtu.be')) {
                            // YouTube video
                            let videoId = '';
                            if (ability.video.includes('v=')) {
                                videoId = ability.video.split('v=')[1].split('&')[0];
                            } else if (ability.video.includes('youtu.be/')) {
                                videoId = ability.video.split('youtu.be/')[1].split('?')[0];
                            }

                            if (videoId) {
                                const iframe = document.createElement('iframe');
                                iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
                                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                                iframe.allowFullscreen = true;
                                videoContainer.appendChild(iframe);
                            }
                        } else {
                            // Direct video file
                            const video = document.createElement('video');
                            video.src = ability.video;
                            video.controls = true;
                            video.autoplay = true;
                            video.muted = true;
                            video.style.width = '100%';
                            videoContainer.appendChild(video);
                        }
                    } else {
                        videoContainer.innerHTML = '<p class="text-center">No video available for this ability</p>';
                    }

                    // Show modal
                    document.getElementById('abilityModal').classList.add('active');
                    document.getElementById('abilityModalOverlay').classList.add('active');
                    document.body.style.overflow = 'hidden';
                })
                .catch(error => {
                    console.error('Error loading ability data:', error);
                });
        });
    });

    // Close modal handlers
    const closeModal = () => {
        document.getElementById('abilityModal').classList.remove('active');
        document.getElementById('abilityModalOverlay').classList.remove('active');
        document.body.style.overflow = '';

        // Pause any videos when closing
        const videos = document.getElementById('abilityModal').querySelectorAll('video, iframe');
        videos.forEach(video => {
            if (video.tagName === 'VIDEO') {
                video.pause();
            } else if (video.tagName === 'IFRAME') {
                video.src = video.src; // Reset to stop YouTube videos
            }
        });
    };

    document.getElementById('abilityModalOverlay').addEventListener('click', closeModal);
    document.getElementById('abilityModalClose').addEventListener('click', closeModal);

    // Close with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('abilityModal').classList.contains('active')) {
            closeModal();
        }
    });
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
        const tanksResponse = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json');
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

async function fetchAndPopulateBuilds(buildsUrl, tankId) {
    const buildsContainer = document.getElementById('builds-container');
    const viewAllButton = document.querySelector('.action-buttons .btn-accent:first-child');

    try {
        const buildsResponse = await fetch(buildsUrl);
        const buildsData = await buildsResponse.json();

        // Filter builds to only include those with buildFeatured: true
        const featuredBuilds = buildsData.buildList.filter(build => build.buildFeatured === true);

        // If there are featured builds, show them (max 3, sorted by date)
        if (featuredBuilds.length > 0) {
            // Sort builds by date (newest first)
            featuredBuilds.sort((a, b) => {
                const dateA = new Date(a.buildDate.split('-').reverse().join('-'));
                const dateB = new Date(b.buildDate.split('-').reverse().join('-'));
                return dateB - dateA;
            });

            // Show only the latest 3 featured builds
            const buildsToShow = featuredBuilds.slice(0, 3);
            populateBuilds(buildsToShow);

            if (viewAllButton) viewAllButton.style.display = 'inline-block';
        } else {
            // No featured builds available, show placeholder
            showBuildsPlaceholder();
            if (viewAllButton) viewAllButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching builds data:', error);
        showBuildsPlaceholder();
        if (viewAllButton) viewAllButton.style.display = 'none';
    }
}

function populateBuilds(builds) {
    const buildsContainer = document.getElementById('builds-container');
    if (!buildsContainer) {
        console.error('Builds container not found');
        return;
    }

    // Clear existing content
    buildsContainer.innerHTML = '';

    // Create build cards for each build
    builds.forEach(build => {
        const buildCard = document.createElement('div');
        buildCard.className = 'build-card';
        buildCard.innerHTML = `
            <div class="build-header">
                ${build.buildName}
            </div>
            <div class="build-content">
                <div class="build-section">
                    <div class="build-section-title">
                        <i class="fas fa-puzzle-piece"></i>
                        <span>Modules</span>
                    </div>
                    <div class="build-items">
                        ${build.modules.map(module => `
                            <div class="build-item">
                                <img src="${module.moduleIcon}" alt="${module.moduleName}">
                                <div class="build-item-tooltip">
                                    <div class="build-item-name">${module.moduleName}</div>
                                    <div class="build-item-description">${module.moduleDescription}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="build-section">
                    <div class="build-section-title">
                        <i class="fas fa-star"></i>
                        <span>Perks</span>
                    </div>
                    <div class="build-items perk-items">
                        ${build.perks.map(perk => `
                            <div class="build-item">
                                <img src="${perk.perkIcon}" alt="${perk.perkName}">
                                <div class="build-item-tooltip">
                                    <div class="build-item-name">${perk.perkName}</div>
                                    <div class="build-item-description">${perk.perkDescription}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="build-section">
                    <div class="build-section-title">
                        <i class="fas fa-toolbox"></i>
                        <span>Equipment</span>
                    </div>
                    <div class="build-items equipment-items">
                        ${build.equipments.map(equipment => `
                            <div class="build-item">
                                <img src="${equipment.equipmentIcon}" alt="${equipment.equipmentName}">
                                <div class="build-item-tooltip">
                                    <div class="build-item-name">${equipment.equipmentName}</div>
                                    <div class="build-item-description">${equipment.equipmentDescription}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        buildsContainer.appendChild(buildCard);
    });

    // Adjust tooltip positions after DOM update
    setTimeout(adjustTooltipPosition, 0);
}

function showBuildsPlaceholder() {
    const buildsContainer = document.getElementById('builds-container');
    if (!buildsContainer) return;

    buildsContainer.innerHTML = `
        <div class="builds-placeholder">
            <div class="placeholder-content">
                <i class="fas fa-tools"></i>
                <h3>Builds Coming Soon</h3>
                <p>We're currently collecting and analyzing the best builds for this tank. Check back soon or contribute your own build!</p>
                <a href="../../../resources/contact-us#main" class="btn-accent">
                    <i></i> Submit Your Build
                </a>
            </div>
        </div>
    `;
}

function adjustTooltipPosition() {
    document.querySelectorAll('.build-item').forEach(item => {
        const tooltip = item.querySelector('.build-item-tooltip');
        if (!tooltip) return;

        item.addEventListener('mouseenter', function() {
            // Make tooltip visible temporarily for measurements
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';

            const tooltipRect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const itemRect = item.getBoundingClientRect();

            // Reset positioning
            tooltip.style.left = '50%';
            tooltip.style.right = 'auto';
            tooltip.style.bottom = 'calc(100% + 10px)';
            tooltip.style.top = 'auto';
            tooltip.style.transform = 'translateX(-50%)';

            // Check right edge overflow
            if (tooltipRect.right > viewportWidth) {
                tooltip.style.left = 'auto';
                tooltip.style.right = '0';
                tooltip.style.transform = 'none';
            }

            // Check left edge overflow
            if (tooltipRect.left < 0) {
                tooltip.style.left = '0';
                tooltip.style.right = 'auto';
                tooltip.style.transform = 'none';
            }

            // Check if tooltip would go above viewport
            if (tooltipRect.top < 0) {
                tooltip.style.bottom = 'auto';
                tooltip.style.top = 'calc(100% + 10px)';
                tooltip.style.transform = 'translateX(-50%)';

                // Adjust arrow position
                const arrow = tooltip.querySelector(':after') || document.createElement('div');
                arrow.style.content = '';
                arrow.style.position = 'absolute';
                arrow.style.bottom = '100%';
                arrow.style.left = '50%';
                arrow.style.transform = 'translateX(-50%)';
                arrow.style.borderWidth = '8px';
                arrow.style.borderStyle = 'solid';
                arrow.style.borderColor = 'transparent transparent var(--card-bg) transparent';
            }
        });

        item.addEventListener('mouseleave', function() {
            // Reset tooltip visibility
            tooltip.style.visibility = '';
            tooltip.style.opacity = '';
        });
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
                agentCountSpan.innerHTML = `<i class="fas fa-users mr-1"></i> Number of Agents: ${agentsData.agents.length}`;
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
    document.title = `${tank.name} - HEAT Labs`;
    document.querySelector('meta[property="og:title"]').content = `HEAT Labs - ${tank.name}`;
    document.querySelector('meta[name="twitter:title"]').content = `HEAT Labs - ${tank.name}`;

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

            // Get the tank ID from meta tag to fetch the correct agents.json
            const tankIdMeta = document.querySelector('meta[name="tank-id"]');
            const tankId = tankIdMeta ? tankIdMeta.content : null;

            if (!tankId) {
                console.error('No tank ID found');
                return;
            }

            try {
                // First get the tank data to find the agents URL
                const tanksResponse = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json');
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

                // Add compatible tanks with clickable links
                if (agent.compatibleTanks && agent.compatibleTanks.length > 0) {
                    agent.compatibleTanks.forEach(tank => {
                        const tankElement = document.createElement('div');
                        tankElement.className = 'agent-modal-tank';

                        // Create link to tank page
                        const tankLink = document.createElement('a');
                        tankLink.href = `../tanks/${tank.slug}`; // Using slug for URL
                        tankLink.style.display = 'contents'; // Makes link inherit parent's display

                        // Create tank image
                        const tankImg = document.createElement('img');
                        tankImg.src = tank.image;
                        tankImg.alt = tank.name;
                        tankImg.loading = 'lazy'; // Lazy loading for better performance

                        // Create tank name
                        const tankName = document.createElement('span');
                        tankName.textContent = tank.name;

                        // Append elements
                        tankLink.appendChild(tankImg);
                        tankLink.appendChild(tankName);
                        tankElement.appendChild(tankLink);
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
            if (h3 && h3.textContent.trim().toUpperCase() === category.toUpperCase()) {
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
            if (nameElement && nameElement.textContent.trim().toUpperCase() === statName.toUpperCase()) {
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

function initializeAccordions() {
    // Initialize strengths accordion
    const strengthsAccordion = document.querySelector('.strengths-accordion');
    if (strengthsAccordion) {
        const strengthItems = strengthsAccordion.querySelectorAll('.accordion-item');

        strengthItems.forEach(item => {
            const header = item.querySelector('.accordion-header');

            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all other items in this accordion
                strengthItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    }

    // Initialize weaknesses accordion
    const weaknessesAccordion = document.querySelector('.weaknesses-accordion');
    if (weaknessesAccordion) {
        const weaknessItems = weaknessesAccordion.querySelectorAll('.accordion-item');

        weaknessItems.forEach(item => {
            const header = item.querySelector('.accordion-header');

            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all other items in this accordion
                weaknessItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    }
}

// Update the initializeTankPageElements function to include the accordion initialization
function initializeTankPageElements() {
    // Initialize image gallery
    initializeImageGallery();

    // Initialize Ability Modals
    initializeAbilityModals();

    // Initialize accordions
    initializeAccordions();

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

// Comparison functionality
function initializeComparisonButton() {
    const tankIdMeta = document.querySelector('meta[name="tank-id"]');
    const currentTankId = tankIdMeta ? tankIdMeta.content : null;

    if (!currentTankId) return;

    const compareBtn = document.querySelector('.quick-actions .compare-btn');
    if (!compareBtn) return;

    // Check if current tank is in comparison
    const isInComparison = comparisonTanks.includes(currentTankId);
    updateComparisonButton(compareBtn, isInComparison);

    // Set up click handler
    compareBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleComparisonClick(currentTankId, compareBtn);
    });

    // Initialize modal
    initializeComparisonModal();
}

function updateComparisonButton(button, isInComparison) {
    if (isInComparison) {
        button.innerHTML = '<i class="fas fa-times"></i><span>Remove from Comparison</span>';
        button.classList.add('added');
    } else {
        button.innerHTML = '<i class="fas fa-exchange-alt"></i><span>Add to Comparison</span>';
        button.classList.remove('added');
    }
}

function handleComparisonClick(tankId, button) {
    const index = comparisonTanks.indexOf(tankId);

    if (index === -1) {
        // Add to comparison
        comparisonTanks.push(tankId);
        showComparisonModal();
    } else {
        // Remove from comparison
        comparisonTanks.splice(index, 1);
    }

    // Update localStorage
    localStorage.setItem('tankComparison', JSON.stringify(comparisonTanks));

    // Update button state
    updateComparisonButton(button, index === -1);
}

function showComparisonModal() {
    const modal = document.getElementById('comparisonModal');
    const overlay = document.getElementById('comparisonModalOverlay');

    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function initializeComparisonModal() {
    const modal = document.getElementById('comparisonModal');
    const overlay = document.getElementById('comparisonModalOverlay');
    const closeBtn = document.getElementById('comparisonModalClose');
    const compareBtn = document.getElementById('comparisonModalCompare');

    if (!modal || !overlay) return;

    // Close modal handlers
    function closeModal() {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    if (compareBtn) {
        compareBtn.addEventListener('click', function() {
            if (comparisonTanks.length > 0) {
                window.location.href = '../check-compare';
            }
        });
    }

    // Close with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
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