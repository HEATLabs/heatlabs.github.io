document.addEventListener('DOMContentLoaded', function() {
    // Function to block right-click on images
    function blockImageRightClick(event) {
        // Check if the right-clicked element is an image or inside an image
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

    // Add event listener to the document
    document.addEventListener('contextmenu', blockImageRightClick, true); // Use capture phase

    // Also handle dynamically loaded images
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.tagName === 'IMG') {
                        node.addEventListener('contextmenu', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        });
                    }
                    // Check for any images within added nodes
                    const images = node.getElementsByTagName('img');
                    for (let i = 0; i < images.length; i++) {
                        images[i].addEventListener('contextmenu', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        });
                    }
                }
            });
        });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});