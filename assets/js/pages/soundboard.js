document.addEventListener('DOMContentLoaded', function() {
    // Soundboard state
    const soundboardState = {
        sounds: [],
        filteredSounds: [],
        favorites: JSON.parse(localStorage.getItem('soundboardFavorites')) || [],
        filters: {
            category: [],
            source: [],
            type: []
        },
        searchTerm: '',
        showFavorites: false,
        currentlyPlaying: null,
        volume: localStorage.getItem('soundboardVolume') || 0.7,
        currentPage: 1,
        soundsPerPage: 40,
        // Flag to prevent unnecessary re-renders
        preventRender: false,
        // Share modal state
        shareModal: null,
        currentSharedSound: null,
        // Track audio elements
        audioElements: new Map()
    };

    // DOM elements
    const soundsGrid = document.getElementById('soundsGrid');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');
    const soundsCount = document.getElementById('soundsCount');
    const playingStatus = document.getElementById('playingStatus');
    const soundSearch = document.getElementById('soundSearch');
    const toggleFavorites = document.getElementById('toggleFavorites');
    const playRandom = document.getElementById('playRandom');
    const activeFilters = document.getElementById('activeFilters');
    const categoryFilters = document.getElementById('categoryFilters');
    const sourceFilters = document.getElementById('sourceFilters');
    const typeFilters = document.getElementById('typeFilters');
    const paginationControls = document.getElementById('paginationControls');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const currentPage = document.getElementById('currentPage');
    const totalPages = document.getElementById('totalPages');
    const pageJumpInput = document.getElementById('pageJumpInput');
    const pageJumpBtn = document.getElementById('pageJumpBtn');

    // Audio context for better sound management
    let audioContext;
    let globalGainNode;

    // Initialize audio context
    function initAudioContext() {
        try {
            audioContext = new(window.AudioContext || window.webkitAudioContext)();
            globalGainNode = audioContext.createGain();
            globalGainNode.gain.value = soundboardState.volume;
            globalGainNode.connect(audioContext.destination);
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }

    // Create share modal
    function createShareModal() {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-modal-content">
                <div class="share-modal-header">
                    <h3 class="share-modal-title">Share this sound!</h3>
                    <button class="share-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="share-sound-preview">
                    <div class="share-sound-info">
                        <div class="share-sound-name" id="shareSoundName">Sound Name</div>
                        <div class="share-sound-description" id="shareSoundDescription">Sound description will appear here</div>
                    </div>
                    <div class="share-sound-meta" id="shareSoundMeta">
                        <!-- Meta tags will be inserted here -->
                    </div>
                </div>
                <div class="share-url-section">
                    <div class="share-url-label">Share this sound:</div>
                    <div class="share-url-container">
                        <input type="text" class="share-url-input" id="shareUrlInput" readonly>
                        <button class="share-copy-btn" id="shareCopyBtn">
                            <i class="fas fa-copy"></i>
                            Copy
                        </button>
                    </div>
                </div>
                <div class="share-sound-player">
                    <button class="play-btn share-play-btn" id="sharePlayBtn">
                        <i class="fas fa-play"></i>
                        Play
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        soundboardState.shareModal = modal;

        // Add event listeners for modal
        const closeBtn = modal.querySelector('.share-modal-close');
        const copyBtn = modal.querySelector('#shareCopyBtn');
        const playBtn = modal.querySelector('#sharePlayBtn');

        closeBtn.addEventListener('click', closeShareModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeShareModal();
            }
        });

        copyBtn.addEventListener('click', copyShareUrl);

        // Direct event listener for share modal play button
        playBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            toggleShareSoundPlayback();
        });

        // Close modal on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeShareModal();
            }
        });
    }

    // Open share modal for a specific sound
    function openShareModal(soundId) {
        // Stop any currently playing sound before opening modal
        if (soundboardState.currentlyPlaying) {
            stopSound(soundboardState.currentlyPlaying);
        }

        const sound = soundboardState.sounds.find(s => s.soundID === soundId);
        if (!sound) return;

        soundboardState.currentSharedSound = sound;

        // Update modal content
        document.getElementById('shareSoundName').textContent = sound.soundName;
        document.getElementById('shareSoundDescription').textContent = sound.soundDescription;

        // Update meta tags
        const metaContainer = document.getElementById('shareSoundMeta');
        metaContainer.innerHTML = `
            <span>${sound.category}</span>
            <span>${sound.soundType}</span>
            ${sound.soundSource ? `<span>${sound.soundSource}</span>` : ''}
        `;

        // Update share URL
        const shareUrl = generateShareUrl(soundId);
        document.getElementById('shareUrlInput').value = shareUrl;

        // Update play button state BEFORE showing modal
        updateSharePlayButton();

        // Show modal
        soundboardState.shareModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close share modal
    function closeShareModal() {
        if (soundboardState.shareModal) {
            soundboardState.shareModal.classList.remove('active');
            document.body.style.overflow = '';

            // Stop the sound when closing modal
            if (soundboardState.currentSharedSound && soundboardState.currentlyPlaying === soundboardState.currentSharedSound.soundID) {
                stopSound(soundboardState.currentSharedSound.soundID);
            }

            soundboardState.currentSharedSound = null;
        }
    }

    // Generate share URL for a sound
    function generateShareUrl(soundId) {
        const currentUrl = window.location.href.split('?')[0]; // Remove existing query params
        return `${currentUrl}?sound=${soundId}`;
    }

    // Copy share URL to clipboard
    async function copyShareUrl() {
        const urlInput = document.getElementById('shareUrlInput');
        const copyBtn = document.getElementById('shareCopyBtn');

        try {
            await navigator.clipboard.writeText(urlInput.value);

            // Visual feedback
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.classList.add('copied');

            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            urlInput.select();
            document.execCommand('copy');
        }
    }

    // Toggle sound playback in share modal
    function toggleShareSoundPlayback() {
        if (!soundboardState.currentSharedSound) return;

        const soundId = soundboardState.currentSharedSound.soundID;

        // If we're already playing this sound, stop it
        if (soundboardState.currentlyPlaying === soundId) {
            stopSound(soundId);
        } else {
            // If another sound is playing, stop it first
            if (soundboardState.currentlyPlaying) {
                stopSound(soundboardState.currentlyPlaying);
            }

            // Small delay to ensure previous sound is fully stopped
            setTimeout(() => {
                playSound(soundId);
            }, 50);
        }
    }

    // Update play button in share modal
    function updateSharePlayButton() {
        const playBtn = document.getElementById('sharePlayBtn');
        if (!playBtn) return;

        if (!soundboardState.currentSharedSound) {
            playBtn.classList.remove('playing');
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            return;
        }

        const isPlaying = soundboardState.currentlyPlaying === soundboardState.currentSharedSound.soundID;

        if (isPlaying) {
            playBtn.classList.add('playing');
            playBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
        } else {
            playBtn.classList.remove('playing');
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        }
    }

    // Check URL for sound parameter and open modal if present
    function checkUrlForSound() {
        const urlParams = new URLSearchParams(window.location.search);
        const soundId = urlParams.get('sound');

        if (soundId) {
            // Wait for sounds to load, then open modal
            const checkSound = setInterval(() => {
                const soundExists = soundboardState.sounds.some(s => s.soundID === soundId);
                if (soundExists) {
                    clearInterval(checkSound);
                    openShareModal(soundId);

                    // Clean URL without reloading page
                    const cleanUrl = window.location.href.split('?')[0];
                    window.history.replaceState({}, document.title, cleanUrl);
                }
            }, 100);

            // Timeout after 5 seconds
            setTimeout(() => clearInterval(checkSound), 5000);
        }
    }

    // Fetch sounds data
    async function fetchSoundsData() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/HEATLabs/HEAT-Labs-Configs/refs/heads/main/sounds.json');
            if (!response.ok) {
                throw new Error('Failed to load sounds data');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading sounds data:', error);
            return {
                categories: []
            };
        }
    }

    // Process sounds data into a flat array
    function processSoundsData(data) {
        const allSounds = [];

        // Check data structure
        const categories = data.categories || data.soundsCategories || [];

        categories.forEach(category => {
            if (category.categoryItems && Array.isArray(category.categoryItems)) {
                category.categoryItems.forEach(sound => {
                    // Add category information to each sound
                    sound.category = category.categoryName;
                    sound.categoryDescription = category.categoryDescription;
                    allSounds.push(sound);
                });
            }
        });

        return allSounds;
    }

    // Get unique values for filters
    function getUniqueValues(sounds, key) {
        const values = sounds.map(sound => sound[key]).filter(Boolean);
        return [...new Set(values)];
    }

    // Initialize filter buttons
    function initFilterButtons(sounds) {
        // Category filters
        const categories = getUniqueValues(sounds, 'category');
        categoryFilters.innerHTML = '';
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.setAttribute('data-category', category);
            button.innerHTML = `<i class="fas fa-folder"></i> ${category}`;
            button.addEventListener('click', () => toggleFilter('category', category, button));
            categoryFilters.appendChild(button);
        });

        // Source filters
        const sources = getUniqueValues(sounds, 'soundSource');
        sourceFilters.innerHTML = '';
        sources.forEach(source => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.setAttribute('data-source', source);
            button.innerHTML = `<i class="fas fa-database"></i> ${source}`;
            button.addEventListener('click', () => toggleFilter('source', source, button));
            sourceFilters.appendChild(button);
        });

        // Type filters
        const types = getUniqueValues(sounds, 'soundType');
        typeFilters.innerHTML = '';
        types.forEach(type => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.setAttribute('data-type', type);
            button.innerHTML = `<i class="fas fa-tag"></i> ${type}`;
            button.addEventListener('click', () => toggleFilter('type', type, button));
            typeFilters.appendChild(button);
        });
    }

    // Create global volume control
    function createGlobalVolumeControl() {
        const volumeControl = document.createElement('div');
        volumeControl.className = 'global-volume-control';
        volumeControl.innerHTML = `
            <div class="volume-label">
                <i class="fas fa-volume-up"></i>
                <span>Volume</span>
            </div>
            <input type="range" class="global-volume-slider" min="0" max="1" step="0.01" value="${soundboardState.volume}">
        `;

        const volumeSlider = volumeControl.querySelector('.global-volume-slider');
        volumeSlider.addEventListener('input', function() {
            setVolume(parseFloat(this.value));
        });

        // Add to controls right
        const controlsRight = document.querySelector('.controls-right');
        controlsRight.insertBefore(volumeControl, controlsRight.firstChild);
    }

    // Calculate available filter options based on current filters
    function calculateAvailableFilters() {
        let availableSounds = soundboardState.sounds;

        // Apply current filters to find available sounds
        if (soundboardState.filters.category.length > 0) {
            availableSounds = availableSounds.filter(sound =>
                soundboardState.filters.category.includes(sound.category)
            );
        }

        if (soundboardState.filters.source.length > 0) {
            availableSounds = availableSounds.filter(sound =>
                soundboardState.filters.source.includes(sound.soundSource)
            );
        }

        if (soundboardState.filters.type.length > 0) {
            availableSounds = availableSounds.filter(sound =>
                soundboardState.filters.type.includes(sound.soundType)
            );
        }

        if (soundboardState.searchTerm) {
            const term = soundboardState.searchTerm.toLowerCase();
            availableSounds = availableSounds.filter(sound =>
                sound.soundName.toLowerCase().includes(term) ||
                sound.soundDescription.toLowerCase().includes(term) ||
                sound.soundID.toLowerCase().includes(term)
            );
        }

        if (soundboardState.showFavorites) {
            availableSounds = availableSounds.filter(sound =>
                soundboardState.favorites.includes(sound.soundID)
            );
        }

        // Get available values for each filter type
        const availableCategories = [...new Set(availableSounds.map(sound => sound.category).filter(Boolean))];
        const availableSources = [...new Set(availableSounds.map(sound => sound.soundSource).filter(Boolean))];
        const availableTypes = [...new Set(availableSounds.map(sound => sound.soundType).filter(Boolean))];

        return {
            categories: availableCategories,
            sources: availableSources,
            types: availableTypes
        };
    }

    // Update filter button states (enable/disable)
    function updateFilterButtonStates() {
        const availableFilters = calculateAvailableFilters();

        // Update category filter buttons
        const categoryButtons = document.querySelectorAll('.filter-btn[data-category]');
        categoryButtons.forEach(button => {
            const category = button.getAttribute('data-category');
            const isActive = soundboardState.filters.category.includes(category);
            const isAvailable = availableFilters.categories.includes(category);

            if (isActive) {
                button.classList.add('active');
                button.disabled = false;
            } else {
                button.classList.remove('active');
                button.disabled = !isAvailable;

                if (!isAvailable) {
                    button.title = 'No sounds available with current filters';
                } else {
                    button.title = '';
                }
            }
        });

        // Update source filter buttons
        const sourceButtons = document.querySelectorAll('.filter-btn[data-source]');
        sourceButtons.forEach(button => {
            const source = button.getAttribute('data-source');
            const isActive = soundboardState.filters.source.includes(source);
            const isAvailable = availableFilters.sources.includes(source);

            if (isActive) {
                button.classList.add('active');
                button.disabled = false;
            } else {
                button.classList.remove('active');
                button.disabled = !isAvailable;

                if (!isAvailable) {
                    button.title = 'No sounds available with current filters';
                } else {
                    button.title = '';
                }
            }
        });

        // Update type filter buttons
        const typeButtons = document.querySelectorAll('.filter-btn[data-type]');
        typeButtons.forEach(button => {
            const type = button.getAttribute('data-type');
            const isActive = soundboardState.filters.type.includes(type);
            const isAvailable = availableFilters.types.includes(type);

            if (isActive) {
                button.classList.add('active');
                button.disabled = false;
            } else {
                button.classList.remove('active');
                button.disabled = !isAvailable;

                if (!isAvailable) {
                    button.title = 'No sounds available with current filters';
                } else {
                    button.title = '';
                }
            }
        });
    }

    // Toggle filter on/off
    function toggleFilter(filterType, value, button) {
        // Don't process if button is disabled (unless it's active)
        if (button.disabled && !button.classList.contains('active')) {
            return;
        }

        const index = soundboardState.filters[filterType].indexOf(value);

        if (index === -1) {
            soundboardState.filters[filterType].push(value);
            button.classList.add('active');
        } else {
            soundboardState.filters[filterType].splice(index, 1);
            button.classList.remove('active');
        }

        soundboardState.currentPage = 1; // Reset to first page when filters change
        soundboardState.preventRender = false; // Ensure normal rendering

        updateActiveFilters();
        filterSounds();
        updateFilterButtonStates();
    }

    // Update active filters display
    function updateActiveFilters() {
        activeFilters.innerHTML = '';

        // Check if any filters are active
        const hasFilters = Object.values(soundboardState.filters).some(arr => arr.length > 0) ||
            soundboardState.searchTerm ||
            soundboardState.showFavorites;

        if (!hasFilters) {
            activeFilters.innerHTML = '<div class="no-filters-message">No filters selected</div>';
            return;
        }

        // Add category filters
        soundboardState.filters.category.forEach(category => {
            const pill = createFilterPill(category, 'category');
            activeFilters.appendChild(pill);
        });

        // Add source filters
        soundboardState.filters.source.forEach(source => {
            const pill = createFilterPill(source, 'source');
            activeFilters.appendChild(pill);
        });

        // Add type filters
        soundboardState.filters.type.forEach(type => {
            const pill = createFilterPill(type, 'type');
            activeFilters.appendChild(pill);
        });

        // Add search term if present
        if (soundboardState.searchTerm) {
            const pill = document.createElement('div');
            pill.className = 'filter-pill';
            pill.innerHTML = `
                Search: "${soundboardState.searchTerm}"
                <button class="remove-filter" data-filter-type="search">
                    <i class="fas fa-times"></i>
                </button>
            `;
            pill.querySelector('.remove-filter').addEventListener('click', () => {
                soundSearch.value = '';
                soundboardState.searchTerm = '';
                soundboardState.currentPage = 1;
                soundboardState.preventRender = false;
                filterSounds();
                updateFilterButtonStates();
            });
            activeFilters.appendChild(pill);
        }

        // Add favorites filter if active
        if (soundboardState.showFavorites) {
            const pill = document.createElement('div');
            pill.className = 'filter-pill';
            pill.innerHTML = `
                Favorites Only
                <button class="remove-filter" data-filter-type="favorites">
                    <i class="fas fa-times"></i>
                </button>
            `;
            pill.querySelector('.remove-filter').addEventListener('click', () => {
                toggleFavorites.classList.remove('active');
                soundboardState.showFavorites = false;
                soundboardState.currentPage = 1;
                soundboardState.preventRender = false;
                filterSounds();
                updateFilterButtonStates();
            });
            activeFilters.appendChild(pill);
        }
    }

    // Create filter pill element
    function createFilterPill(value, filterType) {
        const pill = document.createElement('div');
        pill.className = 'filter-pill';
        pill.innerHTML = `
            ${value}
            <button class="remove-filter" data-filter-type="${filterType}" data-value="${value}">
                <i class="fas fa-times"></i>
            </button>
        `;

        pill.querySelector('.remove-filter').addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter-type');
            const value = this.getAttribute('data-value');

            // Remove from filters
            const index = soundboardState.filters[filterType].indexOf(value);
            if (index !== -1) {
                soundboardState.filters[filterType].splice(index, 1);
            }

            // Update corresponding filter button
            const button = document.querySelector(`.filter-btn[data-${filterType}="${value}"]`);
            if (button) button.classList.remove('active');

            soundboardState.currentPage = 1;
            soundboardState.preventRender = false;
            updateActiveFilters();
            filterSounds();
            updateFilterButtonStates();
        });

        return pill;
    }

    // Filter sounds based on active filters and search
    function filterSounds() {
        let filtered = soundboardState.sounds;

        // Apply category filter
        if (soundboardState.filters.category.length > 0) {
            filtered = filtered.filter(sound =>
                soundboardState.filters.category.includes(sound.category)
            );
        }

        // Apply source filter
        if (soundboardState.filters.source.length > 0) {
            filtered = filtered.filter(sound =>
                soundboardState.filters.source.includes(sound.soundSource)
            );
        }

        // Apply type filter
        if (soundboardState.filters.type.length > 0) {
            filtered = filtered.filter(sound =>
                soundboardState.filters.type.includes(sound.soundType)
            );
        }

        // Apply search filter
        if (soundboardState.searchTerm) {
            const term = soundboardState.searchTerm.toLowerCase();
            filtered = filtered.filter(sound =>
                sound.soundName.toLowerCase().includes(term) ||
                sound.soundDescription.toLowerCase().includes(term) ||
                sound.soundID.toLowerCase().includes(term)
            );
        }

        // Apply favorites filter
        if (soundboardState.showFavorites) {
            filtered = filtered.filter(sound =>
                soundboardState.favorites.includes(sound.soundID)
            );
        }

        soundboardState.filteredSounds = filtered;
        updatePagination();

        // Only render sound cards if not prevented
        if (!soundboardState.preventRender) {
            renderSoundCards();
        }
    }

    // Update pagination controls
    function updatePagination() {
        const totalSounds = soundboardState.filteredSounds.length;
        const calculatedTotalPages = Math.ceil(totalSounds / soundboardState.soundsPerPage);

        // Update pagination info
        currentPage.textContent = soundboardState.currentPage;
        totalPages.textContent = calculatedTotalPages;

        // Update page jump input
        if (pageJumpInput) {
            pageJumpInput.value = soundboardState.currentPage;
            pageJumpInput.setAttribute('max', calculatedTotalPages);
            pageJumpInput.setAttribute('placeholder', `1-${calculatedTotalPages}`);
        }

        // Show/hide pagination controls
        if (calculatedTotalPages > 1) {
            paginationControls.style.display = 'flex';
        } else {
            paginationControls.style.display = 'none';
        }

        // Enable/disable navigation buttons
        prevPage.disabled = soundboardState.currentPage <= 1;
        nextPage.disabled = soundboardState.currentPage >= calculatedTotalPages;

        // Update sounds count
        const startIndex = (soundboardState.currentPage - 1) * soundboardState.soundsPerPage + 1;
        const endIndex = Math.min(soundboardState.currentPage * soundboardState.soundsPerPage, totalSounds);
        soundsCount.textContent = `${totalSounds} sounds (showing ${startIndex}-${endIndex})`;
    }

    // Jump to specific page
    function jumpToPage(pageNumber) {
        const calculatedTotalPages = Math.ceil(soundboardState.filteredSounds.length / soundboardState.soundsPerPage);
        const page = Math.max(1, Math.min(pageNumber, calculatedTotalPages));

        if (page !== soundboardState.currentPage) {
            soundboardState.currentPage = page;
            soundboardState.preventRender = false;
            renderSoundCards();
            updatePagination();
        }
    }

    // Get sounds for current page
    function getSoundsForCurrentPage() {
        const startIndex = (soundboardState.currentPage - 1) * soundboardState.soundsPerPage;
        const endIndex = startIndex + soundboardState.soundsPerPage;
        return soundboardState.filteredSounds.slice(startIndex, endIndex);
    }

    // Create sound card HTML
    function createSoundCard(sound) {
        const isFavorited = soundboardState.favorites.includes(sound.soundID);
        const isPlaying = soundboardState.currentlyPlaying === sound.soundID;

        const card = document.createElement('div');
        card.className = 'sound-card';
        card.setAttribute('data-sound-id', sound.soundID);
        card.setAttribute('data-category', sound.category);
        card.setAttribute('data-source', sound.soundSource);
        card.setAttribute('data-type', sound.soundType);

        card.innerHTML = `
            <div class="sound-card-header">
                <div class="sound-info">
                    <div class="sound-name">${sound.soundName}</div>
                    <div class="sound-meta">
                        <span>${sound.category}</span>
                        <span>${sound.soundType}</span>
                    </div>
                </div>
                <div class="sound-actions">
                    <button class="sound-action-btn favorite-btn ${isFavorited ? 'favorited' : ''}"
                            data-sound-id="${sound.soundID}" title="Add to favorites">
                        <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <button class="sound-action-btn share-btn"
                            data-sound-id="${sound.soundID}" title="Share sound">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
            <div class="sound-card-body">
                <div class="sound-description">${sound.soundDescription}</div>
                <div class="sound-player">
                    <div class="sound-player-controls">
                        <button class="play-btn ${isPlaying ? 'playing' : ''}" data-sound-id="${sound.soundID}">
                            <i class="fas ${isPlaying ? 'fa-stop' : 'fa-play'}"></i>
                            ${isPlaying ? 'Stop' : 'Play'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    // Render sound cards
    function renderSoundCards() {
        soundsGrid.innerHTML = '';

        if (soundboardState.filteredSounds.length === 0) {
            noResults.style.display = 'flex';
            soundsCount.textContent = 'No sounds found';
            return;
        }

        noResults.style.display = 'none';

        const soundsToShow = getSoundsForCurrentPage();

        soundsToShow.forEach(sound => {
            const card = createSoundCard(sound);
            soundsGrid.appendChild(card);
        });

        // Animate cards into view
        animateSoundCards();

        // Update playing status
        updatePlayingStatus();
    }

    // Animate sound cards into view
    function animateSoundCards() {
        const cards = document.querySelectorAll('.sound-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animated');
            }, index * 50);
        });
    }

    // Toggle favorite status
    function toggleFavorite(soundId) {
        const index = soundboardState.favorites.indexOf(soundId);

        if (index === -1) {
            soundboardState.favorites.push(soundId);
        } else {
            soundboardState.favorites.splice(index, 1);
        }

        // Save to localStorage
        localStorage.setItem('soundboardFavorites', JSON.stringify(soundboardState.favorites));

        // Update UI if we're showing favorites
        if (soundboardState.showFavorites) {
            filterSounds();
            updateFilterButtonStates();
        } else {
            // Just update the favorite button for this sound
            const favoriteBtn = document.querySelector(`.favorite-btn[data-sound-id="${soundId}"]`);
            if (favoriteBtn) {
                const isFavorited = soundboardState.favorites.includes(soundId);
                favoriteBtn.classList.toggle('favorited', isFavorited);
                favoriteBtn.innerHTML = `<i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>`;
            }
        }
    }

    // Play or stop a sound
    function playSound(soundId) {
        // Stop currently playing sound if any
        if (soundboardState.currentlyPlaying) {
            stopSound(soundboardState.currentlyPlaying);
        }

        const sound = soundboardState.sounds.find(s => s.soundID === soundId);
        if (!sound) return;

        // Create audio element
        const audio = new Audio(sound.soundFile);
        audio.volume = soundboardState.volume;

        // Store the audio element for this sound
        soundboardState.audioElements.set(soundId, audio);

        // Set up audio event listeners
        audio.addEventListener('ended', () => {
            soundboardState.currentlyPlaying = null;
            soundboardState.audioElements.delete(soundId);
            updatePlayButtons();
            updateSharePlayButton();
            updatePlayingStatus();
        });

        audio.addEventListener('error', (e) => {
            console.error('Error playing sound:', soundId, e);
            soundboardState.currentlyPlaying = null;
            soundboardState.audioElements.delete(soundId);
            updatePlayButtons();
            updateSharePlayButton();
            updatePlayingStatus();
        });

        // Use a promise to handle the play request properly
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Playback started successfully
                soundboardState.currentlyPlaying = soundId;
                updatePlayButtons();
                updateSharePlayButton();
                updatePlayingStatus();
            }).catch(error => {
                console.error('Playback failed:', error);
                soundboardState.currentlyPlaying = null;
                soundboardState.audioElements.delete(soundId);
                updatePlayButtons();
                updateSharePlayButton();
                updatePlayingStatus();
            });
        }
    }

    // Stop a sound
    function stopSound(soundId) {
        // Get the audio element from our Map
        const audio = soundboardState.audioElements.get(soundId);

        if (audio) {
            try {
                // Stop the specific audio element
                audio.pause();
                audio.currentTime = 0;

                // Remove the audio element from our Map
                soundboardState.audioElements.delete(soundId);
            } catch (e) {
                console.error('Error stopping sound:', e);
            }
        }

        // Additional cleanup
        soundboardState.audioElements.forEach((audio, id) => {
            try {
                if (!audio.paused || audio.currentTime > 0) {
                    audio.pause();
                    audio.currentTime = 0;
                    soundboardState.audioElements.delete(id);
                }
            } catch (e) {
                // Ignore errors on cleanup (leftover)
            }
        });

        if (soundboardState.currentlyPlaying === soundId) {
            soundboardState.currentlyPlaying = null;
        }

        updatePlayButtons();
        updateSharePlayButton();
        updatePlayingStatus();
    }

    // Update all play buttons
    function updatePlayButtons() {
        const playButtons = document.querySelectorAll('.play-btn');
        playButtons.forEach(button => {
            const soundId = button.getAttribute('data-sound-id');
            const isPlaying = soundboardState.currentlyPlaying === soundId;

            button.classList.toggle('playing', isPlaying);
            button.innerHTML = `<i class="fas ${isPlaying ? 'fa-stop' : 'fa-play'}"></i> ${isPlaying ? 'Stop' : 'Play'}`;
        });
    }

    // Update playing status display
    function updatePlayingStatus() {
        if (soundboardState.currentlyPlaying) {
            const playingSound = soundboardState.sounds.find(s => s.soundID === soundboardState.currentlyPlaying);
            if (playingSound) {
                playingStatus.innerHTML = `<i class="fas fa-volume-up"></i> Now Playing: ${playingSound.soundName}`;
                playingStatus.style.display = 'flex';
                return;
            }
        }
        playingStatus.style.display = 'none';
    }

    // Set global volume
    function setVolume(volume) {
        soundboardState.volume = volume;
        localStorage.setItem('soundboardVolume', volume);

        // Update all audio elements
        soundboardState.audioElements.forEach(audio => {
            audio.volume = volume;
        });

        // Update global gain node if available
        if (globalGainNode) {
            globalGainNode.gain.value = volume;
        }
    }

    // Play a random sound
    function playRandomSound() {
        if (soundboardState.filteredSounds.length === 0) return;

        const randomIndex = Math.floor(Math.random() * soundboardState.filteredSounds.length);
        const randomSound = soundboardState.filteredSounds[randomIndex];

        playSound(randomSound.soundID);
    }

    // Initialize the soundboard
    async function initSoundboard() {
        try {
            // Show loading indicator
            loadingIndicator.style.display = 'flex';
            soundsGrid.innerHTML = '';

            // Initialize audio context
            initAudioContext();

            // Create share modal
            createShareModal();

            // Fetch and process sounds data
            const data = await fetchSoundsData();
            soundboardState.sounds = processSoundsData(data);
            soundboardState.filteredSounds = soundboardState.sounds;

            // Initialize UI components
            initFilterButtons(soundboardState.sounds);
            createGlobalVolumeControl();
            updateActiveFilters();
            updatePagination();
            renderSoundCards();
            updateFilterButtonStates();

            // Hide loading indicator
            loadingIndicator.style.display = 'none';

            // Check URL for sound parameter
            checkUrlForSound();

        } catch (error) {
            console.error('Error initializing soundboard:', error);
            loadingIndicator.style.display = 'none';
            soundsGrid.innerHTML = '<div class="error-message">Failed to load sounds. Please try again later.</div>';
        }
    }

    // Event Listeners

    // Search input
    soundSearch.addEventListener('input', function() {
        soundboardState.searchTerm = this.value.trim();
        soundboardState.currentPage = 1;
        soundboardState.preventRender = false;
        filterSounds();
        updateFilterButtonStates();
    });

    // Toggle favorites
    toggleFavorites.addEventListener('click', function() {
        soundboardState.showFavorites = !soundboardState.showFavorites;
        this.classList.toggle('active', soundboardState.showFavorites);
        soundboardState.currentPage = 1;
        soundboardState.preventRender = false;
        filterSounds();
        updateActiveFilters();
        updateFilterButtonStates();
    });

    // Play random sound
    playRandom.addEventListener('click', playRandomSound);

    // Pagination controls
    prevPage.addEventListener('click', () => {
        if (soundboardState.currentPage > 1) {
            soundboardState.currentPage--;
            soundboardState.preventRender = false;
            renderSoundCards();
            updatePagination();
        }
    });

    nextPage.addEventListener('click', () => {
        const totalPages = Math.ceil(soundboardState.filteredSounds.length / soundboardState.soundsPerPage);
        if (soundboardState.currentPage < totalPages) {
            soundboardState.currentPage++;
            soundboardState.preventRender = false;
            renderSoundCards();
            updatePagination();
        }
    });

    // Page jump functionality
    if (pageJumpInput && pageJumpBtn) {
        pageJumpBtn.addEventListener('click', () => {
            const pageNumber = parseInt(pageJumpInput.value);
            if (!isNaN(pageNumber) && pageNumber > 0) {
                jumpToPage(pageNumber);
            }
        });

        pageJumpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const pageNumber = parseInt(pageJumpInput.value);
                if (!isNaN(pageNumber) && pageNumber > 0) {
                    jumpToPage(pageNumber);
                }
            }
        });
    }

    // Event delegation for dynamic elements
    document.addEventListener('click', function(e) {
        // Play button in sound cards
        if (e.target.closest('.play-btn') && !e.target.closest('.share-play-btn')) {
            const button = e.target.closest('.play-btn');
            const soundId = button.getAttribute('data-sound-id');

            if (soundboardState.currentlyPlaying === soundId) {
                stopSound(soundId);
            } else {
                // If another sound is playing, stop it first
                if (soundboardState.currentlyPlaying) {
                    stopSound(soundboardState.currentlyPlaying);
                }
                playSound(soundId);
            }
        }

        // Favorite button
        else if (e.target.closest('.favorite-btn')) {
            const button = e.target.closest('.favorite-btn');
            const soundId = button.getAttribute('data-sound-id');
            toggleFavorite(soundId);
        }

        // Share button
        else if (e.target.closest('.share-btn')) {
            const button = e.target.closest('.share-btn');
            const soundId = button.getAttribute('data-sound-id');
            openShareModal(soundId);
        }
    });

    // Initialize the soundboard
    initSoundboard();
});