document.addEventListener('DOMContentLoaded', function() {
    // word code sequence
    const wordCode = ['lizard'];
    let inputBuffer = '';
    let timeoutId = null;

    // Create the Easter egg container
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
    easterEgg.style.opacity = '0';
    easterEgg.style.transition = 'opacity 0.5s ease-in-out';
    easterEgg.style.display = 'none';
    easterEgg.style.cursor = 'pointer';

    // Create the video element
    const video = document.createElement('video');
    video.src = 'https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Images@main/miscellaneous/lizard_easter_egg.mp4';
    video.alt = 'Lizard Lizard Lizard';
    video.style.maxWidth = '90%';
    video.style.maxHeight = '90%';
    video.style.borderRadius = '8px';
    video.style.opacity = '1';
    video.controls = false;
    video.loop = false;
    video.muted = false;
    video.autoplay = true; // Add autoplay

    function hideEasterEgg() {
        easterEgg.style.opacity = '0';
        setTimeout(() => {
            easterEgg.style.display = 'none';
            video.pause();
            video.currentTime = 0;
        }, 700);
    }

    // Click to close
    easterEgg.addEventListener('click', hideEasterEgg);

    // Add elements to DOM
    easterEgg.appendChild(video);
    document.body.appendChild(easterEgg);

    // Preload the video when page loads
    function preloadVideo() {
        video.load();
    }
    preloadVideo();

    // Listen for key presses
    document.addEventListener('keydown', function(event) {
        // Check if the pressed key matches
        const key = event.key.toLowerCase();

        if (key.length === 1 && key.match(/[a-z]/)) {
            inputBuffer += key;

            const maxLength = Math.max(...wordCode.map(code => code.length));
            if (inputBuffer.length > maxLength) {
                inputBuffer = inputBuffer.slice(-maxLength);
            }

            if (wordCode.includes(inputBuffer)) {
                // Reset video to start
                video.currentTime = 0;

                // Show the Easter egg
                easterEgg.style.display = 'flex';
                setTimeout(() => {
                    easterEgg.style.opacity = '1';
                }, 10);

                // Play the video
                video.play().then(() => {
                    timeoutId = setTimeout(hideEasterEgg, (video.duration * 1000) || 15000);
                }).catch(e => {
                    console.log("Video play failed:", e);
                    timeoutId = setTimeout(hideEasterEgg, 15000);
                });

                // Reset buffer
                inputBuffer = '';
            }
        }
    });
});