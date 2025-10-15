document.addEventListener('DOMContentLoaded', function() {
    // Initialize filters
    const filters = {
        creator: [],
        type: []
    };

    // DOM elements
    const activeFiltersContainer = document.querySelector('.active-filters');
    const noFiltersMessage = document.querySelector('.no-filters-message');
    const videosGrid = document.querySelector('.videos-grid');
    const searchInput = document.querySelector('.search-input');
    let videoCards = []; // Will store references to all video cards
    let videoData = []; // Store the video data for filter generation

    // Format date from YYYY-MM-DD to DD Month, YYYY
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Sort videos by date (newest first)
    function sortVideosByDate(videos) {
        return videos.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
    }

    // Fetch video data from JSON file
    async function fetchVideoData() {
        try {
            const response = await fetch('"https://cdn1.heatlabs.net/videos.json');
            // const response = await fetch('../../HEAT-Labs-Configs/videos.json');
            if (!response.ok) {
                throw new Error('Failed to load video data');
            }
            const data = await response.json();
            videoData = data; // Store for filter generation
            return data;
        } catch (error) {
            console.error('Error loading video data:', error);
            return []; // Return empty array if there's an error
        }
    }

    // Generate unique creators and types from video data
    function generateFilterData(videos) {
        const creators = [...new Set(videos.map(video => video.creator))].sort();
        const types = [...new Set(videos.map(video => video.type))].sort();

        return {
            creators,
            types
        };
    }

    // Create filter buttons dynamically
    function createFilterButtons(creators, types) {
        const filtersContainer = document.querySelector('.filters-container');

        // Clear existing filters
        filtersContainer.innerHTML = '';

        // Create creator filters
        if (creators.length > 0) {
            const creatorGroup = document.createElement('div');
            creatorGroup.className = 'filter-group';

            creatorGroup.innerHTML = `
                <h3 class="filter-group-title">CREATOR</h3>
                <div class="filter-buttons-grid" id="creator-filters">
                    ${creators.map(creator => `
                        <button class="filter-btn creator-filter" data-creator="${creator}">
                            <i class="fas fa-user"></i> ${creator}
                        </button>
                    `).join('')}
                </div>
            `;
            filtersContainer.appendChild(creatorGroup);
        }

        // Create type filters
        if (types.length > 0) {
            const typeGroup = document.createElement('div');
            typeGroup.className = 'filter-group';

            typeGroup.innerHTML = `
                <h3 class="filter-group-title">CONTENT TYPE</h3>
                <div class="filter-buttons-grid" id="type-filters">
                    ${types.map(type => `
                        <button class="filter-btn type-filter" data-type="${type}">
                            <i class="${getTypeIcon(type)}"></i> ${type}
                        </button>
                    `).join('')}
                </div>
            `;
            filtersContainer.appendChild(typeGroup);
        }

        // Re-initialize filter buttons after creating them
        initFilterButtons();
    }

    // Get appropriate icon for content type
    function getTypeIcon(type) {
        const iconMap = {
            'Gameplay': 'fas fa-gamepad',
            'Guide': 'fas fa-book',
            'Tutorial': 'fas fa-graduation-cap',
            'Review': 'fas fa-star',
            'Cinematic': 'fas fa-film',
            'News': 'fas fa-newspaper',
            'General': 'fa-solid fa-book-open-reader'
        };
        return iconMap[type] || 'fas fa-video';
    }

    // Create video card HTML
    function createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.setAttribute('data-creator', video.creator);
        card.setAttribute('data-type', video.type);
        card.setAttribute('data-video-id', video.id);

        card.innerHTML = `
            <div class="video-thumbnail-container">
                <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail" onerror="this.src='https://cdn5.heatlabs.net/placeholder/imagefailedtoload.webp'">
                <div class="play-button-overlay">
                    <div class="play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="creator-badge">${video.creator}</div>
            </div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <div class="video-meta">
                    <div class="creator-info">
                        <span>${video.creator}</span>
                    </div>
                    <div class="video-stats">
                        <span><i class="far fa-calendar"></i> ${formatDate(video.date)}</span>
                    </div>
                </div>
                <p class="video-description">${video.description}</p>
                <div class="video-actions">
                    <button class="btn-accent watch-video-btn" data-video-id="${video.id}" data-video-url="${video.url}" data-video-title="${video.title}">
                        <i class="fas fa-play mr-2"></i>Watch Video
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    // Animate video cards into view
    function animateVideoCards() {
        videoCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animated');
            }, index * 100); // Stagger the animations
        });
    }

    // Render all video cards
    async function renderVideoCards() {
        const videos = await fetchVideoData();
        videosGrid.innerHTML = ''; // Clear existing cards

        if (!videos || videos.length === 0) {
            videosGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-film"></i>
                    <h3>No Videos Available</h3>
                    <p>We're currently collecting videos from top community creators. Check back soon!</p>
                </div>
            `;
            return;
        }

        // Sort videos by date (newest first)
        const sortedVideos = sortVideosByDate(videos);

        // Generate filter buttons based on video data
        const filterData = generateFilterData(sortedVideos);
        createFilterButtons(filterData.creators, filterData.types);

        // Create and append cards for each video
        sortedVideos.forEach(video => {
            const card = createVideoCard(video);
            videosGrid.appendChild(card);
        });

        // Store references to all video cards
        videoCards = Array.from(document.querySelectorAll('.video-card'));

        // Animate the cards into view
        animateVideoCards();

        // Initialize all video interaction buttons
        initVideoInteractionButtons();
    }

    // Initialize filter buttons
    function initFilterButtons() {
        // Creator filter buttons
        document.querySelectorAll('.creator-filter').forEach(button => {
            button.addEventListener('click', function() {
                const creator = this.getAttribute('data-creator');
                toggleFilter('creator', creator, this);
                filterVideos();
            });
        });

        // Type filter buttons
        document.querySelectorAll('.type-filter').forEach(button => {
            button.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                toggleFilter('type', type, this);
                filterVideos();
            });
        });

        // Initialize active filters display
        updateActiveFilters();
    }

    // Initialize all video interaction buttons (play button, thumbnail, and watch video button)
    function initVideoInteractionButtons() {
        // Initialize watch video buttons
        document.querySelectorAll('.watch-video-btn').forEach(button => {
            button.addEventListener('click', function() {
                const videoId = this.getAttribute('data-video-id');
                const videoUrl = this.getAttribute('data-video-url');
                const videoTitle = this.getAttribute('data-video-title');
                openVideoModal(videoId, videoUrl, videoTitle);
            });
        });

        // Initialize play button overlays
        document.querySelectorAll('.play-button-overlay').forEach(overlay => {
            overlay.addEventListener('click', function(e) {
                e.stopPropagation();
                const videoCard = this.closest('.video-card');
                if (videoCard) {
                    const videoId = videoCard.getAttribute('data-video-id');
                    const watchButton = videoCard.querySelector('.watch-video-btn');
                    if (watchButton) {
                        const videoUrl = watchButton.getAttribute('data-video-url');
                        const videoTitle = watchButton.getAttribute('data-video-title');
                        openVideoModal(videoId, videoUrl, videoTitle);
                    }
                }
            });
        });

        // Initialize thumbnail clicks
        document.querySelectorAll('.video-thumbnail').forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                const videoCard = this.closest('.video-card');
                if (videoCard) {
                    const videoId = videoCard.getAttribute('data-video-id');
                    const watchButton = videoCard.querySelector('.watch-video-btn');
                    if (watchButton) {
                        const videoUrl = watchButton.getAttribute('data-video-url');
                        const videoTitle = watchButton.getAttribute('data-video-title');
                        openVideoModal(videoId, videoUrl, videoTitle);
                    }
                }
            });
        });

        // Also make the entire thumbnail container clickable for better UX
        document.querySelectorAll('.video-thumbnail-container').forEach(container => {
            container.addEventListener('click', function(e) {
                // Only trigger if the click wasn't on the play button overlay (to avoid double triggers)
                if (!e.target.closest('.play-button-overlay')) {
                    const videoCard = this.closest('.video-card');
                    if (videoCard) {
                        const videoId = videoCard.getAttribute('data-video-id');
                        const watchButton = videoCard.querySelector('.watch-video-btn');
                        if (watchButton) {
                            const videoUrl = watchButton.getAttribute('data-video-url');
                            const videoTitle = watchButton.getAttribute('data-video-title');
                            openVideoModal(videoId, videoUrl, videoTitle);
                        }
                    }
                }
            });
        });
    }

    // Enhanced video modal with better styling
    function openVideoModal(videoId, videoUrl, videoTitle) {
        // Extract YouTube video ID from URL
        const youtubeId = extractYouTubeId(videoUrl);

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-overlay"></div>
            <div class="video-modal-content">
                <div class="video-modal-header">
                    <h3 class="video-modal-title">${videoTitle}</h3>
                    <button class="video-modal-close" aria-label="Close video">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="video-modal-body">
                    ${youtubeId ? `
                        <div class="video-embed-container">
                            <iframe
                                src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                                title="${videoTitle}">
                            </iframe>
                        </div>
                    ` : `
                        <div class="video-embed-fallback">
                            <i class="fab fa-youtube"></i>
                            <h4>Video Preview Unavailable</h4>
                            <p class="mt-2">This video cannot be embedded, but you can watch it directly on YouTube.</p>
                        </div>
                    `}
                </div>
                <div class="video-modal-footer">
                    <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="youtube-link">
                        <i class="fab fa-youtube mr-2"></i>Watch on YouTube
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';

        // Add event listeners
        const overlay = modal.querySelector('.video-modal-overlay');
        const closeBtn = modal.querySelector('.video-modal-close');
        const modalContent = modal.querySelector('.video-modal-content');

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';

            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 400);
        };

        // Close on overlay click
        overlay.addEventListener('click', closeModal);

        // Close on close button click
        closeBtn.addEventListener('click', closeModal);

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Prevent modal content click from closing modal
        modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Animate in
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Focus management for accessibility
        closeBtn.focus();

        return modal;
    }

    // Extract YouTube video ID from URL
    function extractYouTubeId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // Toggle filter on/off
    function toggleFilter(filterType, value, button) {
        const index = filters[filterType].indexOf(value);

        if (index === -1) {
            filters[filterType].push(value);
            button.classList.add('active');
        } else {
            filters[filterType].splice(index, 1);
            button.classList.remove('active');
        }

        updateActiveFilters();
    }

    // Update active filters display
    function updateActiveFilters() {
        activeFiltersContainer.innerHTML = '';

        // Check if any filters are active
        const hasFilters = filters.creator.length > 0 || filters.type.length > 0;

        if (!hasFilters) {
            activeFiltersContainer.innerHTML = '<div class="no-filters-message">No filters selected</div>';
            return;
        }

        // Add creator filters
        filters.creator.forEach(creator => {
            const pill = createFilterPill(creator, 'creator');
            activeFiltersContainer.appendChild(pill);
        });

        // Add type filters
        filters.type.forEach(type => {
            const pill = createFilterPill(type, 'type');
            activeFiltersContainer.appendChild(pill);
        });
    }

    // Create filter pill element
    function createFilterPill(value, filterType) {
        const pill = document.createElement('div');
        pill.className = 'filter-pill';
        pill.innerHTML = `
            ${value}
            <button class="remove-filter" data-filter-type="${filterType}" data-value="${value}" aria-label="Remove ${value} filter">
                <i class="fas fa-times"></i>
            </button>
        `;

        pill.querySelector('.remove-filter').addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter-type');
            const value = this.getAttribute('data-value');

            // Remove from filters
            const index = filters[filterType].indexOf(value);
            if (index !== -1) {
                filters[filterType].splice(index, 1);
            }

            // Update corresponding filter button
            const button = document.querySelector(`.${filterType}-filter[data-${filterType}="${value}"]`);
            if (button) button.classList.remove('active');

            updateActiveFilters();
            filterVideos();
        });

        return pill;
    }

    // Filter videos based on active filters and search
    function filterVideos() {
        if (videoCards.length === 0) return;

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        let hasVisibleCards = false;

        videoCards.forEach(card => {
            const cardCreator = card.getAttribute('data-creator');
            const cardType = card.getAttribute('data-type');
            const cardTitle = card.querySelector('h3').textContent.toLowerCase();
            const cardDescription = card.querySelector('.video-description').textContent.toLowerCase();

            const creatorMatch = filters.creator.length === 0 || filters.creator.includes(cardCreator);
            const typeMatch = filters.type.length === 0 || filters.type.includes(cardType);
            const searchMatch = !searchTerm ||
                cardTitle.includes(searchTerm) ||
                cardDescription.includes(searchTerm) ||
                cardCreator.toLowerCase().includes(searchTerm);

            if (creatorMatch && typeMatch && searchMatch) {
                card.style.display = 'block';
                hasVisibleCards = true;
            } else {
                card.style.display = 'none';
            }
        });

        // Show no results message if no cards are visible
        const noResultsElement = document.querySelector('.no-results');
        if (!hasVisibleCards) {
            if (!noResultsElement) {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>No Videos Found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                `;
                videosGrid.appendChild(noResults);
            }
        } else if (noResultsElement) {
            noResultsElement.remove();
        }
    }

    // Initialize search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterVideos();
        });
    }

    // Clear all filters
    function clearAllFilters() {
        filters.creator = [];
        filters.type = [];

        // Remove active class from all filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        updateActiveFilters();
        filterVideos();
    }

    // Add clear filters button event listener
    const clearFiltersBtn = document.querySelector('.clear-filters-btn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // Initialize the page
    renderVideoCards();
});