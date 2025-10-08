// Corner Cobwebs
(function() {
    'use strict';

    // Toggle Cobwebs
    const COBWEBS_ENABLED = false;

    // Configuration
    const config = {
        // Available cobweb images
        images: {
            cobweb1: 'https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Images@main/miscellaneous/corner-cobweb-1.png',
            cobweb2: 'https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Images@main/miscellaneous/corner-cobweb-2.png',
            cobweb3: 'https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Images@main/miscellaneous/corner-cobweb-3.png',
            cobweb4: 'https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Images@main/miscellaneous/corner-cobweb-4.png'
        },
        // Assign which image goes to which corner
        cornerImages: {
            'top-left': 'cobweb3',
            'top-right': 'cobweb4',
            'bottom-left': 'cobweb2',
            'bottom-right': 'cobweb1'
        },
        // Flip settings for each corner
        flips: {
            'top-left': {
                horizontal: false,
                vertical: false
            },
            'top-right': {
                horizontal: true,
                vertical: false
            },
            'bottom-left': {
                horizontal: true,
                vertical: true
            },
            'bottom-right': {
                horizontal: true,
                vertical: true
            }
        },
        // Size for each corner
        sizes: {
            'top-left': 200,
            'top-right': 300,
            'bottom-left': 200,
            'bottom-right': 200
        },
        // Opacity for each corner
        opacities: {
            'top-left': 0.6,
            'top-right': 0.4,
            'bottom-left': 0.6,
            'bottom-right': 0.4
        },
        // Position offsets for each corner
        offsets: {
            'top-left': {
                top: 0,
                left: 0
            },
            'top-right': {
                top: 0,
                right: 0
            },
            'bottom-left': {
                bottom: -10,
                left: 0
            },
            'bottom-right': {
                bottom: 0,
                right: 0
            }
        }
    };

    // Exit early if cobwebs are disabled
    if (!COBWEBS_ENABLED) {
        return;
    }

    // Create cobweb element
    function createCobweb(corner) {
        const cobweb = document.createElement('div');
        cobweb.className = `cobweb-decoration cobweb-${corner}`;

        // Get size for this corner
        const size = config.sizes[corner];
        const opacity = config.opacities[corner];

        // Base styles for all cobwebs
        Object.assign(cobweb.style, {
            position: 'fixed',
            width: `${size}px`,
            height: `${size}px`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            opacity: opacity,
            pointerEvents: 'none',
            zIndex: '9999',
            transition: 'opacity 0.3s ease'
        });

        // Position based on corner
        const offset = config.offsets[corner];
        const imageKey = config.cornerImages[corner];
        const imageUrl = config.images[imageKey];
        const flip = config.flips[corner];

        // Build transform string for flips
        const transforms = [];
        if (flip.horizontal) transforms.push('scaleX(-1)');
        if (flip.vertical) transforms.push('scaleY(-1)');
        const transformStr = transforms.length > 0 ? transforms.join(' ') : 'none';

        switch (corner) {
            case 'top-left':
                cobweb.style.top = `${offset.top}px`;
                cobweb.style.left = `${offset.left}px`;
                cobweb.style.backgroundImage = `url('${imageUrl}')`;
                cobweb.style.backgroundPosition = 'top left';
                cobweb.style.transform = transformStr;
                break;
            case 'top-right':
                cobweb.style.top = `${offset.top}px`;
                cobweb.style.right = `${offset.right}px`;
                cobweb.style.backgroundImage = `url('${imageUrl}')`;
                cobweb.style.backgroundPosition = 'top right';
                cobweb.style.transform = transformStr;
                break;
            case 'bottom-left':
                cobweb.style.bottom = `${offset.bottom}px`;
                cobweb.style.left = `${offset.left}px`;
                cobweb.style.backgroundImage = `url('${imageUrl}')`;
                cobweb.style.backgroundPosition = 'bottom left';
                cobweb.style.transform = transformStr;
                break;
            case 'bottom-right':
                cobweb.style.bottom = `${offset.bottom}px`;
                cobweb.style.right = `${offset.right}px`;
                cobweb.style.backgroundImage = `url('${imageUrl}')`;
                cobweb.style.backgroundPosition = 'bottom right';
                cobweb.style.transform = transformStr;
                break;
        }

        return cobweb;
    }

    // Initialize cobwebs
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addCobwebs);
        } else {
            addCobwebs();
        }
    }

    // Add all cobwebs to the page
    function addCobwebs() {
        const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

        corners.forEach(corner => {
            const cobweb = createCobweb(corner);
            document.body.appendChild(cobweb);
        });
    }

    init();
})();

// Ambiance Radio Easter Egg
(() => {
    const STORAGE_PREFIX = 'heatlabs_radio_';
    let radioStations = [];
    let currentStationIndex = 0;
    let audioPlayer = null;
    let isPlaying = false;
    let currentVolume = 0.5;

    // Load persistent state from sessionStorage
    const loadRadioState = () => {
        try {
            const savedStations = sessionStorage.getItem(STORAGE_PREFIX + 'stations');
            const savedIndex = sessionStorage.getItem(STORAGE_PREFIX + 'currentIndex');
            const savedVolume = sessionStorage.getItem(STORAGE_PREFIX + 'volume');
            const savedIsPlaying = sessionStorage.getItem(STORAGE_PREFIX + 'isPlaying');
            const savedModalVisible = sessionStorage.getItem(STORAGE_PREFIX + 'modalVisible');

            if (savedStations) {
                radioStations = JSON.parse(savedStations);
            }
            if (savedIndex !== null) {
                currentStationIndex = parseInt(savedIndex, 10);
            }
            if (savedVolume !== null) {
                currentVolume = parseFloat(savedVolume);
            }
            if (savedIsPlaying === 'true') {
                isPlaying = true;
            }

            // Restore modal if it was visible
            if (savedModalVisible === 'true') {
                setTimeout(() => {
                    showRadioModal();
                    if (isPlaying && radioStations.length > 0) {
                        setTimeout(() => playCurrentStation(), 100);
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error loading radio state:', error);
        }
    };

    // Save persistent state to sessionStorage
    const saveRadioState = () => {
        try {
            sessionStorage.setItem(STORAGE_PREFIX + 'stations', JSON.stringify(radioStations));
            sessionStorage.setItem(STORAGE_PREFIX + 'currentIndex', currentStationIndex.toString());
            sessionStorage.setItem(STORAGE_PREFIX + 'volume', currentVolume.toString());
            sessionStorage.setItem(STORAGE_PREFIX + 'isPlaying', isPlaying.toString());
            const modalVisible = document.getElementById('arabicRadioModal')?.classList.contains('show') || false;
            sessionStorage.setItem(STORAGE_PREFIX + 'modalVisible', modalVisible.toString());
        } catch (error) {
            console.error('Error saving radio state:', error);
        }
    };

    // Save state before page unload
    window.addEventListener('beforeunload', saveRadioState);

    // Create and style the radio modal
    const createRadioModal = () => {
        const existingModal = document.getElementById('arabicRadioModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'arabicRadioModal';
        modal.className = 'arabic-radio-modal';

        modal.innerHTML = `
            <div class="arabic-radio-header">
                <h3>HEAT Labs Radio Stations</h3>
                <button class="arabic-radio-close">&times;</button>
            </div>
            <div class="arabic-radio-body">
                <div class="arabic-radio-station-info">
                    <div class="arabic-radio-station-name">Loading stations...</div>
                </div>
                <div class="arabic-radio-controls">
                    <button class="arabic-radio-prev" title="Previous station">
                        <i class="fas fa-backward"></i>
                    </button>
                    <button class="arabic-radio-play" title="Play/Pause">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="arabic-radio-next" title="Next station">
                        <i class="fas fa-forward"></i>
                    </button>
                </div>
                <div class="arabic-radio-volume">
                    <input type="range" min="0" max="1" step="0.01" value="${currentVolume}" class="arabic-radio-volume-slider">
                    <i class="fas fa-volume-up"></i>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.arabic-radio-close').addEventListener('click', hideRadioModal);
        modal.querySelector('.arabic-radio-prev').addEventListener('click', playPreviousStation);
        modal.querySelector('.arabic-radio-play').addEventListener('click', togglePlayPause);
        modal.querySelector('.arabic-radio-next').addEventListener('click', playNextStation);
        modal.querySelector('.arabic-radio-volume-slider').addEventListener('input', adjustVolume);

        // Load stations when modal is first shown
        if (radioStations.length === 0) {
            loadRadioStations();
        } else {
            updateStationInfo();
        }
    };

    // Show the radio modal
    const showRadioModal = () => {
        if (!document.getElementById('arabicRadioModal')) {
            createRadioModal();
        }
        document.getElementById('arabicRadioModal').classList.add('show');
        saveRadioState();
    };

    // Hide the radio modal
    const hideRadioModal = () => {
        const modal = document.getElementById('arabicRadioModal');
        if (modal) {
            modal.classList.remove('show');
            saveRadioState();
        }
    };

    // Load radio stations from API
    const loadRadioStations = async () => {
        const modal = document.getElementById('arabicRadioModal');

        try {
            // Halloween radio station URL
            const stationUrl = 'https://de1.api.radio-browser.info/json/stations/byuuid/ab98e449-edb9-4670-ba10-3fefd6011b9d';

            const response = await fetch(stationUrl);
            const stations = await response.json();

            // Handle both single station and array response
            if (Array.isArray(stations)) {
                radioStations = stations;
            } else {
                radioStations = [stations];
            }

            if (radioStations.length > 0) {
                if (currentStationIndex >= radioStations.length) {
                    currentStationIndex = 0;
                }
                updateStationInfo();
                saveRadioState();
            } else {
                if (modal) {
                    modal.querySelector('.arabic-radio-station-name').textContent = 'No stations found';
                }
            }
        } catch (error) {
            console.error('Error loading radio stations:', error);
            if (modal) {
                modal.querySelector('.arabic-radio-station-name').textContent = 'Error loading stations';
            }
        }
    };

    // Update station info in the modal
    const updateStationInfo = () => {
        const modal = document.getElementById('arabicRadioModal');
        if (!modal || radioStations.length === 0) return;

        const station = radioStations[currentStationIndex];
        modal.querySelector('.arabic-radio-station-name').textContent = station.name || 'Unknown Station';
        //modal.querySelector('.arabic-radio-station-country').textContent = station.country || '';

        // Play the station
        const playButton = modal.querySelector('.arabic-radio-play');
        if (playButton) {
            playButton.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        }

        // Update volume slider
        const volumeSlider = modal.querySelector('.arabic-radio-volume-slider');
        if (volumeSlider) {
            volumeSlider.value = currentVolume;
        }
    };

    // Play the current station
    const playCurrentStation = () => {
        if (radioStations.length === 0) return;

        const station = radioStations[currentStationIndex];
        const playButton = document.querySelector('.arabic-radio-play');

        // Stop any currently playing audio
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer = null;
        }

        // Create new audio player
        const streamUrl = station.url_resolved || station.url;
        if (!streamUrl) return;

        audioPlayer = new Audio(streamUrl);
        audioPlayer.volume = currentVolume;
        audioPlayer.crossOrigin = "anonymous";

        // Update play button to pause icon
        if (playButton) {
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
        }

        // Play the station
        audioPlayer.play().then(() => {
            isPlaying = true;
            saveRadioState();
        }).catch(error => {
            console.error('Error playing station:', error);
            if (playButton) {
                playButton.innerHTML = '<i class="fas fa-play"></i>';
            }
            isPlaying = false;
            saveRadioState();
        });

        // Handle audio end/error events
        audioPlayer.addEventListener('ended', () => {
            isPlaying = false;
            saveRadioState();
        });

        audioPlayer.addEventListener('error', () => {
            isPlaying = false;
            saveRadioState();
            if (playButton) {
                playButton.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
    };

    // Toggle play/pause
    const togglePlayPause = () => {
        const playButton = document.querySelector('.arabic-radio-play');

        if (!audioPlayer && radioStations.length > 0) {
            playCurrentStation();
            return;
        }

        if (!audioPlayer) return;

        if (audioPlayer.paused) {
            audioPlayer.play().then(() => {
                if (playButton) {
                    playButton.innerHTML = '<i class="fas fa-pause"></i>';
                }
                isPlaying = true;
                saveRadioState();
            }).catch(error => {
                console.error('Error playing station:', error);
                isPlaying = false;
                saveRadioState();
            });
        } else {
            audioPlayer.pause();
            if (playButton) {
                playButton.innerHTML = '<i class="fas fa-play"></i>';
            }
            isPlaying = false;
            saveRadioState();
        }
    };

    // Play next station
    const playNextStation = () => {
        if (radioStations.length === 0) return;

        currentStationIndex = (currentStationIndex + 1) % radioStations.length;
        updateStationInfo();
        if (isPlaying) {
            playCurrentStation();
        }
        saveRadioState();
    };

    // Play previous station
    const playPreviousStation = () => {
        if (radioStations.length === 0) return;

        currentStationIndex = (currentStationIndex - 1 + radioStations.length) % radioStations.length;
        updateStationInfo();
        if (isPlaying) {
            playCurrentStation();
        }
        saveRadioState();
    };

    // Adjust volume
    const adjustVolume = (event) => {
        currentVolume = parseFloat(event.target.value);
        if (audioPlayer) {
            audioPlayer.volume = currentVolume;
        }
        saveRadioState();
    };

    // Add CSS to the document head
    const addRadioStyles = () => {
        // Remove existing styles if they exist
        const existingStyle = document.getElementById('arabicRadioStyles');
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = 'arabicRadioStyles';
        style.textContent = `
            .arabic-radio-modal {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 300px;
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid #444;
                border-radius: 8px;
                color: white;
                font-family: inherit;
                z-index: 9999;
                transform: translateY(120%);
                transition: transform 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            }

            .arabic-radio-modal.show {
                transform: translateY(0);
            }

            .arabic-radio-header {
                padding: 12px 15px;
                background: #141312;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #333;
            }

            .arabic-radio-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .arabic-radio-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0 5px;
            }

            .arabic-radio-close:hover {
                color: #ccc;
            }

            .arabic-radio-body {
                padding: 15px;
            }

            .arabic-radio-station-info {
                margin-bottom: 15px;
            }

            .arabic-radio-station-name {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .arabic-radio-station-country {
                font-size: 12px;
                color: #aaa;
            }

            .arabic-radio-controls {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-bottom: 15px;
            }

            .arabic-radio-controls button {
                background: #333;
                border: none;
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.2s;
            }

            .arabic-radio-controls button:hover {
                background: #444;
            }

            .arabic-radio-volume {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .arabic-radio-volume-slider {
                flex-grow: 1;
                cursor: pointer;
            }

            @media (max-width: 400px) {
                .arabic-radio-modal {
                    width: calc(100% - 40px);
                    right: 10px;
                    bottom: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    };

    // Initialize the radio system
    const initRadio = () => {
        addRadioStyles();
        loadRadioState();


        setTimeout(() => {
            const cobwebElements = document.querySelectorAll('[class*="cobweb"]');
            if (cobwebElements.length > 0) {
                // Cobwebs are enabled, show the radio modal
                showRadioModal();
            }
        }, 1000);
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRadio);
    } else {
        initRadio();
    }
})();