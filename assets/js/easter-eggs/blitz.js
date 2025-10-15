document.addEventListener('DOMContentLoaded', function() {
    // Konami code sequence (arrow keys only): ↑ ↑ ↓ ↓ ← → ← →
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                       'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
    let konamiIndex = 0;
    let timeoutId = null;
    let sound = null; // Will hold our Audio object

    // Create the easter egg container
    const easterEgg = document.createElement('div');
    easterEgg.style.position = 'fixed';
    easterEgg.style.top = '0';
    easterEgg.style.left = '0';
    easterEgg.style.width = '100%';
    easterEgg.style.height = '100%';
    easterEgg.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    easterEgg.style.display = 'flex';
    easterEgg.style.justifyContent = 'center';
    easterEgg.style.alignItems = 'center';
    easterEgg.style.zIndex = '9999';
    easterEgg.style.display = 'none';
    easterEgg.style.cursor = 'pointer';

    // Create the GIF element
    const gif = document.createElement('img');
    gif.src = 'https://cdn5.heatlabs.net/miscellaneous/blitz_whos_gonna_tell_him.gif';
    gif.alt = 'Blitz Easter Egg';
    gif.style.maxWidth = '90%';
    gif.style.maxHeight = '90%';
    gif.style.borderRadius = '8px';

    // Function to hide the easter egg and stop sound
    function hideEasterEgg() {
        easterEgg.style.display = 'none';
        if (sound) {
            sound.pause();
            sound.currentTime = 0; // Reset to beginning
        }
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    // Click to close
    easterEgg.addEventListener('click', hideEasterEgg);

    // Add elements to DOM
    easterEgg.appendChild(gif);
    document.body.appendChild(easterEgg);

    // Preload the sound when page loads
    function preloadSound() {
        sound = new Audio('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Database@main/sounds/blitz.wav');
        sound.load();
    }
    preloadSound();

    // Listen for key presses
    document.addEventListener('keydown', function(event) {
        // Check if the pressed key matches the current position in sequence
        if (event.key === konamiCode[konamiIndex]) {
            konamiIndex++;

            // Full sequence entered
            if (konamiIndex === konamiCode.length) {
                // Ensure we have a sound object
                if (!sound) {
                    sound = new Audio('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Database@main/sounds/blitz.wav');
                }

                // Reset sound to start
                sound.currentTime = 0;

                // Play the sound and show GIF when playback starts
                sound.play().then(() => {
                    // Show the easter egg only when sound starts playing
                    easterEgg.style.display = 'flex';

                    // Set timeout to hide after 6 seconds from when sound started
                    timeoutId = setTimeout(hideEasterEgg, 6000);
                }).catch(e => {
                    console.log("Sound play failed:", e);
                    // Fallback: show GIF anyway if sound fails
                    easterEgg.style.display = 'flex';
                    timeoutId = setTimeout(hideEasterEgg, 6000);
                });

                // Reset for next time
                konamiIndex = 0;
            }
        } else {
            // Wrong key - reset
            konamiIndex = 0;
        }
    });
});