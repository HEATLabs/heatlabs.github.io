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
        preventRender: false
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

    // Fetch sounds data
    async function fetchSoundsData() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/HEATLabs/Website-Configs/refs/heads/main/sounds.json');
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

    // Toggle filter on/off
    function toggleFilter(filterType, value, button) {
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
                            data-sound-id="${sound.soundID}">
                        <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
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

            // If clicking the same sound that's playing, just stop it
            if (soundboardState.currentlyPlaying === soundId) {
                soundboardState.currentlyPlaying = null;
                updatePlayingStatus();
                // Only update the specific sound card instead of re-rendering all
                updateSoundCardUI(soundId);
                return;
            }
        }

        const sound = soundboardState.sounds.find(s => s.soundID === soundId);
        if (!sound) return;

        // Create audio element
        const audio = new Audio(sound.soundFile);
        audio.volume = soundboardState.volume;

        // Play the sound
        audio.play();
        soundboardState.currentlyPlaying = soundId;

        // Update UI without re-rendering all cards
        updatePlayingStatus();
        updateSoundCardUI(soundId);

        // Handle audio end
        audio.addEventListener('ended', () => {
            soundboardState.currentlyPlaying = null;
            updatePlayingStatus();
            updateSoundCardUI(soundId);
        });

        // Handle audio errors
        audio.addEventListener('error', () => {
            console.error('Error playing sound:', sound.soundName);
            soundboardState.currentlyPlaying = null;
            updatePlayingStatus();
            updateSoundCardUI(soundId);
        });
    }

    // Update only the specific sound card UI instead of re-rendering all
    function updateSoundCardUI(soundId) {
        const soundCard = document.querySelector(`.sound-card[data-sound-id="${soundId}"]`);
        if (!soundCard) return;

        const isPlaying = soundboardState.currentlyPlaying === soundId;
        const playBtn = soundCard.querySelector('.play-btn');
        const playIcon = playBtn.querySelector('i');

        if (isPlaying) {
            playBtn.classList.add('playing');
            playIcon.className = 'fas fa-stop';
            playBtn.innerHTML = `<i class="fas fa-stop"></i> Stop`;
        } else {
            playBtn.classList.remove('playing');
            playIcon.className = 'fas fa-play';
            playBtn.innerHTML = `<i class="fas fa-play"></i> Play`;
        }
    }

    // Stop a sound
    function stopSound(soundId) {
        // Find all audio elements and stop them
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });

        soundboardState.currentlyPlaying = null;
        updatePlayingStatus();

        // Update the specific sound card if it exists
        if (soundId) {
            updateSoundCardUI(soundId);
        }
    }

    // Update playing status display
    function updatePlayingStatus() {
        if (soundboardState.currentlyPlaying) {
            const sound = soundboardState.sounds.find(s => s.soundID === soundboardState.currentlyPlaying);
            playingStatus.textContent = `Now playing: ${sound ? sound.soundName : 'Unknown'}`;
            playingStatus.className = 'playing-status playing';
            playingStatus.innerHTML = `<i class="fas fa-volume-up"></i> Now playing: ${sound ? sound.soundName : 'Unknown'}`;
        } else {
            playingStatus.textContent = 'No sound playing';
            playingStatus.className = 'playing-status';
            playingStatus.innerHTML = `<i class="fas fa-volume-mute"></i> No sound playing`;
        }
    }

    // Set global volume
    function setVolume(volume) {
        soundboardState.volume = volume;
        localStorage.setItem('soundboardVolume', volume);

        // Update all audio elements
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
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

        // Set flag to prevent full re-render
        soundboardState.preventRender = true;

        playSound(randomSound.soundID);

        // Reset the flag after a short delay
        setTimeout(() => {
            soundboardState.preventRender = false;
        }, 100);
    }

    // Initialize the soundboard
    async function initSoundboard() {
        // Initialize audio context
        initAudioContext();

        // Show loading indicator
        loadingIndicator.style.display = 'flex';
        soundsGrid.style.display = 'none';

        // Fetch sounds data
        const data = await fetchSoundsData();
        soundboardState.sounds = processSoundsData(data);
        soundboardState.filteredSounds = [...soundboardState.sounds];

        // Initialize filter buttons
        initFilterButtons(soundboardState.sounds);

        // Create global volume control
        createGlobalVolumeControl();

        // Set initial volume
        setVolume(soundboardState.volume);

        // Hide loading indicator and show sounds
        loadingIndicator.style.display = 'none';
        soundsGrid.style.display = 'grid';

        // Render initial sounds
        filterSounds();

        // Set up event listeners
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Search input
        soundSearch.addEventListener('input', function() {
            soundboardState.searchTerm = this.value.trim();
            soundboardState.currentPage = 1;
            soundboardState.preventRender = false;
            filterSounds();
        });

        // Toggle favorites
        toggleFavorites.addEventListener('click', function() {
            this.classList.toggle('active');
            soundboardState.showFavorites = !soundboardState.showFavorites;
            soundboardState.currentPage = 1;
            soundboardState.preventRender = false;
            filterSounds();
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
            const calculatedTotalPages = Math.ceil(soundboardState.filteredSounds.length / soundboardState.soundsPerPage);
            if (soundboardState.currentPage < calculatedTotalPages) {
                soundboardState.currentPage++;
                soundboardState.preventRender = false;
                renderSoundCards();
                updatePagination();
            }
        });

        // Event delegation for sound cards
        soundsGrid.addEventListener('click', function(e) {
            const playBtn = e.target.closest('.play-btn');
            const favoriteBtn = e.target.closest('.favorite-btn');

            if (playBtn) {
                const soundId = playBtn.getAttribute('data-sound-id');
                soundboardState.preventRender = true; // Prevent re-render for individual plays
                playSound(soundId);
                setTimeout(() => {
                    soundboardState.preventRender = false;
                }, 100);
            }

            if (favoriteBtn) {
                const soundId = favoriteBtn.getAttribute('data-sound-id');
                toggleFavorite(soundId);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Space bar to play/stop (when not focused on input)
            if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (soundboardState.currentlyPlaying) {
                    stopSound(soundboardState.currentlyPlaying);
                } else if (soundboardState.filteredSounds.length > 0) {
                    soundboardState.preventRender = true;
                    playRandomSound();
                }
            }

            // Escape to stop sound
            if (e.code === 'Escape' && soundboardState.currentlyPlaying) {
                stopSound(soundboardState.currentlyPlaying);
            }
        });
    }

    // Initialize the soundboard when DOM is loaded
    initSoundboard();
});