// Arabic Radio Easter Egg
(() => {
    const TRIGGER_WORDS = {
        'venom': 'https://de1.api.radio-browser.info/json/stations/search?limit=10&tagList=lofi&hidebroken=true&order=clickcount&reverse=true',
        'راديو': 'https://de1.api.radio-browser.info/json/stations/search?limit=10&tagList=arabic&hidebroken=true&order=clickcount&reverse=true',
        'traviemo': 'https://de1.api.radio-browser.info/json/stations/search?limit=10&tagList=80s en español&hidebroken=true&order=clickcount&reverse=true'
    }; // "radio" in Saudi Arabic
    const STORAGE_PREFIX = 'heatlabs_radio_';
    let radioStations = [];
    let currentStationIndex = 0;
    let audioPlayer = null;
    let inputBuffer = '';
    let isPlaying = false;
    let currentVolume = 0.5;
    let currentTriggerWord = null;

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
                    <div class="arabic-radio-station-country"></div>
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
        if (!modal || !currentTriggerWord) return;

        try {
            for (const url in TRIGGER_WORDS) {
                const response = await fetch(TRIGGER_WORDS[currentTriggerWord]);
                radioStations = await response.json();
            }
            if (radioStations.length > 0) {
                if (currentStationIndex >= radioStations.length) {
                    currentStationIndex = 0;
                }
                updateStationInfo();
                saveRadioState();
            } else {
                modal.querySelector('.arabic-radio-station-name').textContent = 'No stations found';
            }
        } catch (error) {
            console.error('Error loading radio stations:', error);
            modal.querySelector('.arabic-radio-station-name').textContent = 'Error loading stations';
        }
    };

    // Update station info in the modal
    const updateStationInfo = () => {
        const modal = document.getElementById('arabicRadioModal');
        if (!modal || radioStations.length === 0) return;

        const station = radioStations[currentStationIndex];
        modal.querySelector('.arabic-radio-station-name').textContent = station.name;
        modal.querySelector('.arabic-radio-station-country').textContent = station.country || '';

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
        audioPlayer = new Audio(station.url_resolved || station.url);
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
                playButton.innerHTML = '<i class="fas fa-pause"></i>';
                isPlaying = true;
                saveRadioState();
            }).catch(error => {
                console.error('Error playing station:', error);
                isPlaying = false;
                saveRadioState();
            });
        } else {
            audioPlayer.pause();
            playButton.innerHTML = '<i class="fas fa-play"></i>';
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

    // Check for trigger word - Updated to handle Arabic characters
    window.addEventListener('input', (event) => {
        // Handle input from text fields, textareas, etc.
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            const inputValue = event.target.value;
            for (const word in TRIGGER_WORDS) {
                if (inputValue.includes(word)) {
                    currentTriggerWord = word;
                    showRadioModal();
                    // Clear the trigger word from the input
                    event.target.value = inputValue.replace(TRIGGER_WORDS, '');
                    break;
                }
            }
        }
    });

    // Also listen for keypress events to catch Arabic characters in real-time
    window.addEventListener('keypress', (event) => {
        // Skip if typing in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = event.key;

        // Add any character (including Arabic) to buffer
        if (key && key.length === 1) {
            inputBuffer += key;

            // Keep buffer length reasonable (double the trigger word length)
            const maxLength = Math.max(...Object.keys(TRIGGER_WORDS).map(w => w.length)) * 2;
            if (inputBuffer.length > maxLength) {
                inputBuffer = inputBuffer.slice(-maxLength);
            }

            // Check if buffer contains the trigger word
            for (const word in TRIGGER_WORDS) {
                if (inputBuffer.includes(word)) {
                    currentTriggerWord = word;
                    showRadioModal();
                    inputBuffer = ''; // Reset Buffer
                    break;
                }
            }
        }
    });

    // Alternative: Listen for composition events (for IME input methods)
    window.addEventListener('compositionend', (event) => {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const data = event.data;
        for (const word in TRIGGER_WORDS) {
            if (data && data.includes(word)) {
                currentTriggerWord = word;
                showRadioModal();
                break;
            }
        }
    });

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
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRadio);
    } else {
        initRadio();
    }
})();