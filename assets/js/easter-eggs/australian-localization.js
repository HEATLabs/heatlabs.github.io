// Australian Localization Easter Egg - Type "mirror" to flip the page upside down
document.addEventListener('DOMContentLoaded', function() {
    let typedString = '';
    const triggerWord = 'mirror';
    let isMirrored = false;

    document.addEventListener('keydown', function(e) {
        // Only listen to letter keys
        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            typedString += e.key.toLowerCase();

            // Check if the typed string ends with the trigger word
            if (typedString.slice(-triggerWord.length) === triggerWord) {
                toggleMirrorMode();
                typedString = ''; // Reset after triggering
            }

            // Keep the buffer from getting too long
            if (typedString.length > triggerWord.length * 2) {
                typedString = typedString.slice(-triggerWord.length);
            }
        }
    });

    function toggleMirrorMode() {
        isMirrored = !isMirrored;

        if (isMirrored) {
            // Apply full flip effect to body (mirror + upside down)
            document.body.style.transform = 'scale(-1, -1)';
            document.body.style.transformOrigin = 'center';

            // Special handling for different elements
            const images = document.querySelectorAll('img');
            const noFlipElements = document.querySelectorAll(
                'input, textarea, select, button, iframe, video, .no-flip'
            );

            // Flip images with additional rotation for extra effect
            images.forEach(img => {
                img.style.transform = 'scale(-1, -1)';
                img.style.transformOrigin = 'center';
            });

            // Counter-flip elements that should remain normal
            noFlipElements.forEach(el => {
                el.style.transform = 'scale(-1, -1)';
                el.style.transformOrigin = 'center';
            });

            // Show a subtle notification (also flipped)
            const notification = document.createElement('div');
            notification.textContent = 'Australian localization activated!';
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = 'rgba(0,0,0,0.7)';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '5px';
            notification.style.zIndex = '10000';
            notification.style.transform = 'scale(-1, -1)';
            notification.id = 'australian-notification';

            document.body.appendChild(notification);

            // Remove notification after 3 seconds
            setTimeout(() => {
                const existingNotif = document.getElementById('australian-notification');
                if (existingNotif) {
                    existingNotif.remove();
                }
            }, 3000);
        } else {
            // Remove all flip effects
            document.body.style.transform = '';

            const images = document.querySelectorAll('img');
            const noFlipElements = document.querySelectorAll(
                'input, textarea, select, button, iframe, video, .no-flip'
            );

            images.forEach(img => {
                img.style.transform = '';
            });

            noFlipElements.forEach(el => {
                el.style.transform = '';
            });
        }
    }
});