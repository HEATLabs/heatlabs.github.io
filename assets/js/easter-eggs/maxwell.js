document.addEventListener('DOMContentLoaded', function() {
    // Create audio element
    const audio = new Audio('https://raw.githubusercontent.com/HEATLabs/HEAT-Labs-Database/refs/heads/main/sounds/maxwell.mp3');
    const maxwellGif = document.querySelector('.maxwell-gif');

    // Ensure we have the element
    if (!maxwellGif) {
        console.error('Maxwell GIF element not found');
        return;
    }

    // Set audio properties
    audio.loop = true;
    audio.volume = 0.5;

    // Store audio state
    let isPlaying = false;

    // Create audio context if not exists
    let audioContext;
    try {
        audioContext = new(window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.error('Web Audio API not supported', e);
    }

    // Function to resume audio context when needed
    const resumeAudioContext = async () => {
        if (audioContext && audioContext.state === 'suspended') {
            try {
                await audioContext.resume();
            } catch (error) {
                console.error('Failed to resume audio context:', error);
            }
        }
    };

    // Function to toggle audio playback
    const toggleAudio = async () => {
        try {
            // Resume audio context first if needed
            await resumeAudioContext();

            if (isPlaying) {
                audio.pause();
                isPlaying = false;
                maxwellGif.classList.remove('playing');
            } else {
                await audio.play();
                isPlaying = true;
                maxwellGif.classList.add('playing');
                maxwellGif.classList.remove('needs-interaction');
            }
        } catch (error) {
            console.log('Audio playback failed:', error);
            // Show click-to-play instruction
            maxwellGif.classList.add('needs-interaction');
            isPlaying = false;
        }
    };

    // Make GIF clickable
    maxwellGif.style.cursor = 'pointer';
    maxwellGif.addEventListener('click', toggleAudio);
    maxwellGif.addEventListener('touchstart', toggleAudio, {
        passive: true
    });

    // Initial setup
    const initAudio = () => {
        // Modern browsers require user interaction for audio playback
        // Ill just prepare everything but wont autoplay (200 IQ)
        maxwellGif.classList.add('needs-interaction');

        // Store audio in window for potential control later
        window.maxwellAudio = {
            audio: audio,
            toggle: toggleAudio,
            isPlaying: () => isPlaying
        };
    };

    // Initialize
    initAudio();
});