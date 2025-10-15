// Initialize variables
let currentAgentId = null;

// Agent Page JS for HEAT Labs
document.addEventListener('DOMContentLoaded', function() {
    // Get agent ID from meta tag
    const agentIdMeta = document.querySelector('meta[name="agent-id"]');
    const agentId = agentIdMeta ? agentIdMeta.content : null;

    // Fetch and display view count
    fetchViewCount().then(views => {
        displayViewCounter(views);
    });

    // If agent ID is specified, fetch and populate agent data
    if (agentId) {
        fetchAgentData(agentId);
    }

    // Initialize any interactive elements specific to agent pages
    initializeAgentPageElements();
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

// Function to display view counter in the agent header
function displayViewCounter(views) {
    const agentMeta = document.querySelector('.agent-meta');
    if (agentMeta) {
        // Check if view counter already exists
        if (!agentMeta.querySelector('.map-views-counter')) {
            const viewCounter = document.createElement('span');
            viewCounter.className = 'map-views-counter';
            viewCounter.innerHTML = `
                <i class="fas fa-eye"></i>
                <span class="map-views-count">${views.totalViews.toLocaleString()}</span> views
            `;
            agentMeta.appendChild(viewCounter);
        }
    }
}

// Function to fetch agent data based on ID
async function fetchAgentData(agentId) {
    try {
        // First fetch the agents.json to get the agent details
        const agentsResponse = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/agents.json');
        const agentsData = await agentsResponse.json();

        // Find the agent with matching ID
        const agent = agentsData.agents.find(a => a.id.toString() === agentId.toString());

        if (!agent) {
            console.error('Agent not found with ID:', agentId);
            return;
        }

        // Update page elements with agent data
        updateAgentPageElements(agent);

        // Populate abilities if available
        if (agent.specialty) {
            populateAbilities(agent);
        }

        // Populate compatible tanks if available
        if (agent.compatibleTanks) {
            populateCompatibleTanks(agent.compatibleTanks);
        }

    } catch (error) {
        console.error('Error fetching agent data:', error);
    }
}

function populateAbilities(agent) {
    const abilitiesContainer = document.getElementById('abilities-container');
    if (!abilitiesContainer) return;

    // Clear existing content
    abilitiesContainer.innerHTML = '';

    // Create ability card
    const abilityCard = document.createElement('div');
    abilityCard.className = 'ability-card';

    abilityCard.innerHTML = `
        <div class="ability-info text-center">
            <h4>${agent.specialty}</h4>
            <p class="ability-description">${agent.description}</p>
        </div>
    `;

    abilitiesContainer.appendChild(abilityCard);
}

function populateCompatibleTanks(tanks) {
    const tanksContainer = document.getElementById('tanks-container');
    if (!tanksContainer) {
        console.error('Tanks container not found');
        return;
    }

    // Clear existing content
    tanksContainer.innerHTML = '';

    // Create tank cards for each tank
    tanks.forEach(tank => {
        const tankCard = document.createElement('div');
        tankCard.className = 'tank-card';
        tankCard.innerHTML = `
            <div class="tank-img-container">
                <img src="${tank.image}" alt="${tank.name}" class="tank-img" loading="lazy" onerror="this.src='https://cdn5.heatlabs.net/placeholder/imagefailedtoload.webp'">
            </div>
            <div class="tank-info">
                <h3>${tank.name}</h3>
            </div>
        `;

        // Make the card clickable to go to the tank page
        tankCard.addEventListener('click', () => {
            window.location.href = `../tanks/${tank.slug}`;
        });

        tanksContainer.appendChild(tankCard);
    });

    // Update tank count in header
    const tankCountSpan = document.querySelector('.agent-header .agent-meta span:nth-child(2)');
    if (tankCountSpan) {
        tankCountSpan.innerHTML = `<i class="fas fa-users mr-1"></i> Number of Tanks: ${tanks.length}`;
    }
}

function updateAgentPageElements(agent) {
    // Update page title and meta tags
    document.title = `${agent.name} - HEAT Labs`;
    document.querySelector('meta[property="og:title"]').content = `HEAT Labs - ${agent.name}`;
    document.querySelector('meta[name="twitter:title"]').content = `HEAT Labs - ${agent.name}`;

    // Update agent header information
    const agentHeader = document.querySelector('.agent-header');
    if (agentHeader) {
        const statusBadge = agentHeader.querySelector('.agent-status-badge');
        if (statusBadge && agent.status) {
            statusBadge.textContent = agent.status;
        }

        const agentTitle = agentHeader.querySelector('.agent-title');
        if (agentTitle) {
            agentTitle.textContent = agent.name;
        }

        const agentDescription = agentHeader.querySelector('.agent-description');
        if (agentDescription) {
            agentDescription.textContent = agent.story || agent.description;
        }
    }

    // Update agent image
    const agentImage = document.querySelector('.agent-image img');
    if (agentImage) {
        agentImage.src = agent.image;
        agentImage.alt = agent.name;
    }

    // Update sidebar quick facts
    const sidebarQuickFacts = document.querySelector('.sidebar-card ul');
    if (sidebarQuickFacts) {
        sidebarQuickFacts.innerHTML = `
            <li><strong>Agent Status:</strong> ${agent.status}</li>
            <li><strong>Number of Tanks:</strong> ${agent.compatibleTanks ? agent.compatibleTanks.length : 0}</li>
        `;
    }
}

function initializeAgentPageElements() {
    // Initialize image gallery
    initializeImageGallery();
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
    document.querySelectorAll('.agent-image img').forEach(img => {
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
    document.querySelectorAll('.agent-image img, .sidebar-card .gallery-thumbnail').forEach((element, index) => {
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