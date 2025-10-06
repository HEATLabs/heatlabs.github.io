// Tournament Page JS for HEAT Labs
let tanksData = [];

// Load tanks data
async function loadTanksData() {
    try {
        const response = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json');
        if (!response.ok) {
            throw new Error('Failed to fetch tanks data');
        }
        tanksData = await response.json();
        window.tanksData = tanksData;
    } catch (error) {
        console.error('Error loading tanks data:', error);
    }
}

// Load tanks data when the script runs
loadTanksData();

document.addEventListener('DOMContentLoaded', function() {
    // Get tournament ID from meta tag
    const tournamentIdMeta = document.querySelector('meta[name="tournament-id"]');
    const tournamentId = tournamentIdMeta ? tournamentIdMeta.content : null;

    // If tournament ID is specified, fetch and populate tournament data
    if (tournamentId) {
        fetchTournamentData(tournamentId);
    }

    // Initialize team modals
    initializeTeamModals();

    // Initialize any interactive elements specific to tournament pages
    initializeTournamentPageElements();
});

// Function to fetch tournament data based on ID
async function fetchTournamentData(tournamentId) {
    try {
        // First fetch the tournaments.json to get the tournament details
        const tournamentsResponse = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tournaments.json');
        if (!tournamentsResponse.ok) {
            throw new Error(`Failed to fetch tournaments list: ${tournamentsResponse.status}`);
        }

        const tournamentsData = await tournamentsResponse.json();

        // Find the tournament with matching ID
        const tournament = tournamentsData.find(t => t['tournament-id'] === tournamentId);

        if (!tournament) {
            console.error('Tournament not found with ID:', tournamentId);
            return;
        }

        // Fetch the actual tournament data
        const tournamentDataResponse = await fetch(tournament['tournament-data']);
        if (!tournamentDataResponse.ok) {
            throw new Error(`Failed to fetch tournament data: ${tournamentDataResponse.status}`);
        }

        const tournamentData = await tournamentDataResponse.json();

        // Update page elements with tournament data
        updateTournamentPageElements(tournamentId, tournamentData);

    } catch (error) {
        console.error('Error fetching tournament data:', error);
        // Show error message to user
        const teamsContainer = document.getElementById('top-teams-container');
        if (teamsContainer) {
            teamsContainer.innerHTML = `
                <div class="col-span-full text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>Failed to load tournament data. Please try again later.</p>
                </div>
            `;
        }
    }
}

function updateTournamentPageElements(tournamentId, tournamentData) {
    // Update tournament header information
    const tournamentHeader = document.querySelector('.tournament-header');
    if (tournamentHeader) {
        // Update team count in header
        const teamCountSpan = tournamentHeader.querySelector('.tournament-meta span:nth-child(3)');
        if (teamCountSpan && tournamentData.total_teams) {
            teamCountSpan.innerHTML = `<i class="fas fa-users mr-1"></i> ${tournamentData.total_teams} Teams`;
        }

        // Also update quick facts in sidebar
        const quickFacts = document.querySelector('.sidebar-card ul');
        if (quickFacts && tournamentData.total_teams) {
            const teamCountItem = quickFacts.querySelector('li:first-child');
            if (teamCountItem) {
                teamCountItem.innerHTML = `<strong>Number of Teams:</strong> ${tournamentData.total_teams}`;
            }
        }
    }

    // Fetch and display view count
    fetchViewCount().then(views => {
        const tournamentMeta = document.querySelector('.tournament-meta');
        if (tournamentMeta) {
            const viewCounter = document.createElement('span');
            viewCounter.className = 'tournament-views-counter';
            viewCounter.innerHTML = `
                <i class="fas fa-eye"></i>
                <span class="tournament-views-count">${views.totalViews.toLocaleString()}</span> views
            `;
            tournamentMeta.appendChild(viewCounter);
        }
    });

    // Populate top teams
    if (tournamentData.top_3_teams && tournamentData.top_3_teams.length > 0) {
        populateTopTeams(tournamentData.top_3_teams);
    }
}

// Function to fetch view count from API
async function fetchViewCount() {
    try {
        // Get the tracking pixel URL from the meta tag
        const trackingPixel = document.querySelector('.heatlabs-tracking-pixel');
        if (!trackingPixel || !trackingPixel.src) {
            return { totalViews: 0 };
        }

        // Convert tracking URL to stats API URL
        const statsApiUrl = trackingPixel.src.replace('/track/', '/stats?image=');
        const response = await fetch(statsApiUrl);

        if (!response.ok) {
            throw new Error('Failed to load view count');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading view count:', error);
        return { totalViews: 0 }; // Return 0 if there's an error
    }
}

function populateTopTeams(teams) {
    const teamsContainer = document.getElementById('top-teams-container');
    const template = document.getElementById('team-card-template');

    if (!teamsContainer || !template) {
        console.error('Required elements for team cards not found');
        return;
    }

    // Clear loading state
    teamsContainer.innerHTML = '';

    // Create team cards for each team
    teams.forEach((team, index) => {
        const card = template.content.cloneNode(true);
        const teamCard = card.querySelector('.team-card');
        const teamImage = card.querySelector('.team-logo-img');
        const teamName = card.querySelector('.team-name');
        const teamCaptain = card.querySelector('.team-captain');
        const teamMotto = card.querySelector('.team-motto');
        const teamPlacement = card.querySelector('.team-placement');
        const teamMemberCount = card.querySelector('.team-member-count');

        // Determine placement text
        let placementText = '';
        if (index === 0) placementText = '1st Place';
        else if (index === 1) placementText = '2nd Place';
        else if (index === 2) placementText = '3rd Place';

        // Set team data on the card
        if (teamCard) teamCard.dataset.team = JSON.stringify(team);
        if (teamImage) {
            teamImage.src = team.team_logo || 'https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Images@main/placeholder/placeholder-image.webp';
            teamImage.alt = `${team.team_name} Logo` || 'Team Logo';
        }
        if (teamName) teamName.textContent = team.team_name || 'Unknown Team';
        if (teamCaptain) teamCaptain.textContent = `Captain: ${team.team_captain || 'Unknown'}`;
        if (teamMotto) teamMotto.textContent = team.team_motto || 'No motto available';
        if (teamPlacement) teamPlacement.textContent = placementText;

        // Calculate member count
        const memberCount = team.team_members ? team.team_members.split(',').length : 0;
        if (teamMemberCount) {
            teamMemberCount.textContent = memberCount > 0 ? `${memberCount} members` : 'No members';
        }

        teamsContainer.appendChild(card);
    });

    // Reinitialize modals for the new cards
    initializeTeamModals();
}

function initializeTeamModals() {
    // Team modal elements
    const teamModal = document.getElementById('teamModal');
    const teamModalOverlay = document.getElementById('teamModalOverlay');
    const teamModalClose = document.getElementById('teamModalClose');

    // Only proceed if modal elements exist
    if (!teamModal || !teamModalOverlay || !teamModalClose) {
        console.warn('Team modal elements not found - modal functionality disabled');
        return;
    }

    // Set up click handlers for all team cards
    const teamCards = document.querySelectorAll('.team-card');
    if (teamCards.length > 0) {
        teamCards.forEach(card => {
            // Remove any existing click handlers to avoid duplicates
            card.removeEventListener('click', handleTeamCardClick);
            card.addEventListener('click', handleTeamCardClick);
        });
    } else {
        console.warn('No team cards found - modal functionality disabled');
    }

    // Close modal handlers
    teamModalOverlay.removeEventListener('click', closeTeamModal);
    teamModalOverlay.addEventListener('click', closeTeamModal);

    teamModalClose.removeEventListener('click', closeTeamModal);
    teamModalClose.addEventListener('click', closeTeamModal);

    // Close with ESC key
    document.removeEventListener('keydown', handleEscKey);
    document.addEventListener('keydown', handleEscKey);

    function handleTeamCardClick() {
        // Get the team data from the card's data attributes
        try {
            const teamData = this.dataset.team ? JSON.parse(this.dataset.team) : {};
            openTeamModal(teamData);
        } catch (e) {
            console.error('Error parsing team data:', e);
        }
    }

    function handleEscKey(e) {
        if (e.key === 'Escape' && teamModal.classList.contains('active')) {
            closeTeamModal();
        }
    }

    function closeTeamModal() {
        teamModal.classList.remove('active');
        teamModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function openTeamModal(team) {
    const teamModal = document.getElementById('teamModal');
    const teamModalOverlay = document.getElementById('teamModalOverlay');
    const teamModalImage = document.getElementById('teamModalImage');
    const teamModalName = document.getElementById('teamModalName');
    const teamModalCaptain = document.getElementById('teamModalCaptain');
    const teamModalDescription = document.getElementById('teamModalDescription');
    const teamModalMotto = document.getElementById('teamModalMotto');
    const teamModalMembers = document.getElementById('teamModalMembers');
    const teamModalTanksContainer = document.getElementById('teamModalTanksContainer');

    // Only proceed if all required elements exist
    if (!teamModal || !teamModalOverlay) {
        console.error('Required team modal elements not found');
        return;
    }

    // Populate modal with team data
    if (teamModalImage) {
        teamModalImage.src = team.team_logo || 'https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Images@main/placeholder/placeholder-image.webp';
        teamModalImage.alt = team.team_name || 'Team Logo';
    }
    if (teamModalName) teamModalName.textContent = team.team_name || 'Unknown Team';
    if (teamModalCaptain) teamModalCaptain.textContent = `Captain: ${team.team_captain || 'Unknown'}`;
    if (teamModalDescription) teamModalDescription.textContent = team.team_description || 'No description available';
    if (teamModalMotto) teamModalMotto.textContent = team.team_motto ? `"${team.team_motto}"` : 'No motto available';
    if (teamModalMembers) teamModalMembers.textContent = team.team_members || 'No member information available';

    // Clear previous tank images
    if (teamModalTanksContainer) {
        teamModalTanksContainer.innerHTML = '';

        // Add team tanks if available
        if (team.team_tanks && team.team_tanks.length > 0) {
            team.team_tanks.forEach(tank => {
                const tankElement = document.createElement('div');
                tankElement.className = 'team-modal-tank';

                const tankLink = document.createElement('a');
                tankLink.href = `../tanks/${getTankSlug(tank.tank_name)}`;
                tankLink.className = 'tank-link';
                const tankImg = document.createElement('img');
                tankImg.src = tank.tank_image || 'https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Images@main/placeholder-image.webp';
                tankImg.alt = tank.tank_name || 'Tank Image';
                tankImg.loading = 'lazy';

                const tankInfo = document.createElement('div');
                tankInfo.className = 'text-center mt-2';
                tankInfo.innerHTML = `
                    <div class="font-medium">${tank.player_name || 'Unknown Player'}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">${tank.tank_name || 'Unknown Tank'}</div>
                `;

                tankLink.appendChild(tankImg);
                tankLink.appendChild(tankInfo);
                tankElement.appendChild(tankLink);
                teamModalTanksContainer.appendChild(tankElement);
            });
        } else {
            teamModalTanksContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No tank information available</p>';
        }
    }

    // Show modal
    teamModal.classList.add('active');
    teamModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function getTankSlug(tankName) {
    if (!tankName) return '';

    // Try to find the tank in the tanks.json data
    if (window.tanksData) {
        const tank = window.tanksData.find(t => t.name === tankName);
        if (tank) return tank.slug;
    }

    // For fallback we convert the name to a slug format
    return tankName.toLowerCase().replace(/\s+/g, '-');
}

function initializeTournamentPageElements() {
    // Initialize image gallery
    initializeImageGallery();

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
        const elementsToAnimate = document.querySelectorAll('.team-card, .sidebar-card');
        if (elementsToAnimate.length > 0) {
            elementsToAnimate.forEach(el => {
                observer.observe(el);
            });
        }
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

    // Only proceed if required elements exist
    if (!galleryModal || !galleryMainImage || !galleryImageCaption ||
        !galleryThumbnailsContainer || !galleryCloseBtn ||
        !galleryPrevBtn || !galleryNextBtn) {
        console.warn('Gallery elements not found - gallery functionality disabled');
        return;
    }

    // Collect all images from the page that should be in the gallery
    const galleryImages = [];

    // Add main content images
    const tournamentImages = document.querySelectorAll('.tournament-image img');
    if (tournamentImages.length > 0) {
        tournamentImages.forEach(img => {
            galleryImages.push({
                src: img.src,
                alt: img.alt,
                caption: img.alt
            });
        });
    }

    // Add sidebar gallery images
    const sidebarThumbnails = document.querySelectorAll('.sidebar-card .gallery-thumbnail img');
    if (sidebarThumbnails.length > 0) {
        sidebarThumbnails.forEach(img => {
            galleryImages.push({
                src: img.parentElement.href || img.src,
                alt: img.alt,
                caption: img.alt
            });
        });
    }

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
        const thumbnails = document.querySelectorAll('.gallery-thumbnail-item');
        if (thumbnails.length > 0) {
            thumbnails.forEach((thumb, idx) => {
                thumb.classList.toggle('active', idx === currentImageIndex);
            });
        }

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
        if (galleryMainImage) {
            galleryMainImage.classList.remove('zoomed');
        }
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
    const galleryTriggers = document.querySelectorAll('.tournament-image img, .sidebar-card .gallery-thumbnail');
    if (galleryTriggers.length > 0) {
        galleryTriggers.forEach((element, index) => {
            element.removeEventListener('click', handleGalleryTriggerClick);
            element.addEventListener('click', handleGalleryTriggerClick);
        });
    }

    function handleGalleryTriggerClick(e) {
        e.preventDefault();
        const index = Array.from(galleryTriggers).indexOf(e.currentTarget);
        if (index !== -1) {
            openGallery(index);
        }
    }

    // Navigation buttons
    galleryPrevBtn.removeEventListener('click', handlePrevClick);
    galleryPrevBtn.addEventListener('click', handlePrevClick);

    galleryNextBtn.removeEventListener('click', handleNextClick);
    galleryNextBtn.addEventListener('click', handleNextClick);

    function handlePrevClick() {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateGalleryImage();
    }

    function handleNextClick() {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateGalleryImage();
    }

    // Close button
    galleryCloseBtn.removeEventListener('click', closeGallery);
    galleryCloseBtn.addEventListener('click', closeGallery);

    // Close when clicking outside the image
    galleryModal.removeEventListener('click', handleModalClick);
    galleryModal.addEventListener('click', handleModalClick);

    function handleModalClick(e) {
        if (e.target === galleryModal) {
            closeGallery();
        }
    }

    // Zoom functionality
    if (galleryMainImage) {
        galleryMainImage.removeEventListener('click', handleImageClick);
        galleryMainImage.addEventListener('click', handleImageClick);
    }

    function handleImageClick() {
        galleryMainImage.classList.toggle('zoomed');
    }

    // Keyboard navigation
    document.removeEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);

    function handleKeyDown(e) {
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
    }

    // Swipe support for touch devices
    let touchStartX = 0;
    let touchEndX = 0;

    if (galleryMainImage) {
        galleryMainImage.removeEventListener('touchstart', handleTouchStart);
        galleryMainImage.addEventListener('touchstart', handleTouchStart, {
            passive: true
        });

        galleryMainImage.removeEventListener('touchend', handleTouchEnd);
        galleryMainImage.addEventListener('touchend', handleTouchEnd, {
            passive: true
        });
    }

    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }

    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }

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