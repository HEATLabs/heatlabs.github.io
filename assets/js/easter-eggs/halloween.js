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