document.addEventListener('DOMContentLoaded', function() {
    // Function to block right-click and drag on images
    function blockImageActions(event) {
        let target = event.target;
        while (target && target !== document) {
            if (target.tagName === 'IMG') {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
            target = target.parentNode;
        }
    }

    // Function to block drag start on images
    function blockImageDrag(event) {
        let target = event.target;
        while (target && target !== document) {
            if (target.tagName === 'IMG') {
                event.preventDefault();
                return false;
            }
            target = target.parentNode;
        }
    }

    // Add event listener to the document
    document.addEventListener('contextmenu', blockImageActions, true); // Use capture phase
    document.addEventListener('dragstart', blockImageDrag, true);
    document.addEventListener('mousedown', function(event) {
        // Prevent default behavior on mouse down for images to block click-and-hold
        let target = event.target;
        while (target && target !== document) {
            if (target.tagName === 'IMG') {
                event.preventDefault();
                return false;
            }
            target = target.parentNode;
        }
    }, true);

    // Also handle dynamically loaded images
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.tagName === 'IMG') {
                        setupImageProtection(node);
                    }
                    // Check for any images within added nodes
                    const images = node.getElementsByTagName('img');
                    for (let i = 0; i < images.length; i++) {
                        setupImageProtection(images[i]);
                    }
                }
            });
        });
    });

    // Set up protection for individual images
    function setupImageProtection(imgElement) {
        // Block right-click
        imgElement.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

        // Block drag start
        imgElement.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });

        // Block mouse down (click and hold)
        imgElement.addEventListener('mousedown', function(e) {
            e.preventDefault();
            return false;
        });

        // Set draggable attribute to false
        imgElement.setAttribute('draggable', 'false');

        // Prevent default behavior on drag events
        imgElement.addEventListener('drag', function(e) {
            e.preventDefault();
            return false;
        });
    }

    // Set up protection for existing images on page load
    const existingImages = document.getElementsByTagName('img');
    for (let i = 0; i < existingImages.length; i++) {
        setupImageProtection(existingImages[i]);
    }

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});