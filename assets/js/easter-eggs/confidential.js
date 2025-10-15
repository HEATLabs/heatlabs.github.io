// Easter Egg: Click tank title 7 times to reveal confidential image
document.addEventListener('DOMContentLoaded', function() {
    const tankTitle = document.querySelector('.tank-title');
    let clickCount = 0;
    const requiredClicks = 7;
    const easterEggImageUrl = 'https://cdn5.heatlabs.net/miscellaneous/CONFIDENTIAL.png';

    if (tankTitle) {
        // Store original cursor style to restore later
        const originalCursor = tankTitle.style.cursor;

        tankTitle.addEventListener('click', function() {
            clickCount++;

            // Reset count if too much time passes between clicks (1.5 seconds)
            if (clickCount === 1) {
                setTimeout(() => {
                    if (clickCount < requiredClicks) {
                        clickCount = 0;
                    }
                }, 1500);
            }

            // Show the Easter egg after 7 clicks
            if (clickCount === requiredClicks) {
                clickCount = 0; // Reset for potential future use

                // Create the overlay and image
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                overlay.style.zIndex = '9999';
                overlay.style.display = 'flex';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.cursor = 'pointer';

                const img = document.createElement('img');
                img.src = easterEggImageUrl;
                img.style.maxWidth = '90%';
                img.style.maxHeight = '90%';
                img.style.objectFit = 'contain';

                // Close when clicking anywhere
                overlay.addEventListener('click', function() {
                    document.body.removeChild(overlay);
                });

                // Add to DOM
                overlay.appendChild(img);
                document.body.appendChild(overlay);

                // Also close on Escape key
                document.addEventListener('keydown', function closeOnEscape(e) {
                    if (e.key === 'Escape') {
                        document.body.removeChild(overlay);
                        document.removeEventListener('keydown', closeOnEscape);
                    }
                });
            }
        });

        // Add subtle visual feedback on click without cursor change
        const originalTransform = tankTitle.style.transform;
        tankTitle.style.transition = 'transform 0.1s';
        tankTitle.addEventListener('mousedown', function() {
            tankTitle.style.transform = 'scale(0.98)';
        });
        tankTitle.addEventListener('mouseup', function() {
            tankTitle.style.transform = originalTransform || 'scale(1)';
        });
        tankTitle.addEventListener('mouseleave', function() {
            tankTitle.style.transform = originalTransform || 'scale(1)';
        });
    }
});