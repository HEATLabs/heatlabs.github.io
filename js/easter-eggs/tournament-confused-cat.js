document.addEventListener('DOMContentLoaded', function() {
    // word code sequence
    const wordCode = ['confused'];
    let inputBuffer = '';
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
    gif.src = 'https://raw.githubusercontent.com/PCWStats/Website-Images/main/miscellaneous/tournament_confused_cat.gif';
    gif.alt = 'Tournament Easter Egg';
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
        sound = new Audio('https://github.com/PCWStats/Database-Files/raw/refs/heads/main/sounds/tournament_confused_cat.wav');
        sound.load();
    }
    preloadSound();

    // Listen for key presses
    document.addEventListener('keydown', function(event) {
        // Check if the pressed key matches the current position in sequence
        const key = event.key.toLowerCase();

        // Only consider a-z characters
        if (key.length === 1 && key.match(/[a-z]/)) {
            inputBuffer += key;

            // Keep buffer length within the longest code
            const maxLength = Math.max(...wordCode.map(code => code.length));
            if (inputBuffer.length > maxLength) {
                inputBuffer = inputBuffer.slice(-maxLength);
            }

            // Check if buffer matches any of the secret words
            if (wordCode.includes(inputBuffer)) {
                // Ensure we have a sound object
                if (!sound) {
                    sound = new Audio('https://github.com/PCWStats/Database-Files/raw/refs/heads/main/sounds/tournament_confused_cat.wav');
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
                inputBuffer = '';
            }
        }
    });
});