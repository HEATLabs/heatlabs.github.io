// WIP Modal functionality for HEAT Labs
document.addEventListener('DOMContentLoaded', function() {
    // Create modal HTML structure
    const modalHTML = `
        <div class="wip-modal-overlay" id="wipModalOverlay">
            <div class="wip-modal" id="wipModal">
                <div class="wip-modal-icon">
                    <i class="fas fa-tools"></i>
                </div>
                <h2 class="wip-modal-title" id="wipModalTitle">Work In Progress</h2>
                <p class="wip-modal-message" id="wipModalMessage">This feature is currently in development and not yet available. Stay tuned for its release!</p>
                <div class="wip-modal-buttons" id="wipModalButtons">
                    <button class="wip-modal-button wip-modal-button-primary" id="wipModalGotIt">Got it!</button>
                </div>
            </div>
        </div>
    `;

    // Add modal to the DOM immediately
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get modal elements
    const wipModalOverlay = document.getElementById('wipModalOverlay');
    const wipModal = document.getElementById('wipModal');
    const wipModalTitle = document.getElementById('wipModalTitle');
    const wipModalMessage = document.getElementById('wipModalMessage');
    const wipModalButtons = document.getElementById('wipModalButtons');

    // Track if bypass keys are pressed
    let bypassActive = false;
    let isModalOpen = false;

    // Debounce function to prevent multiple rapid triggers
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // keydown event listener for bypass
    const handleKeyDown = debounce(function(e) {
        if (e.ctrlKey && e.shiftKey && e.altKey && !isModalOpen) {
            bypassActive = true;
            // Show a indicator that bypass is active
            document.body.classList.add('bypass-active');
        }
    }, 50);

    // Optimized keyup event listener to reset bypass
    const handleKeyUp = debounce(function(e) {
        if (!e.ctrlKey || !e.shiftKey || !e.altKey) {
            bypassActive = false;
            document.body.classList.remove('bypass-active');
        }
    }, 50);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Function to show the WIP modal
    function showWipModal(event, href, isBypass = false) {
        // Prevent default action immediately
        if (event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }

        // Prevent multiple modals from opening
        if (isModalOpen) {
            return;
        }

        isModalOpen = true;

        // Use requestAnimationFrame for smoother animations
        requestAnimationFrame(() => {
            if (isBypass && bypassActive) {
                // Show experimental warning modal
                wipModalTitle.textContent = 'Experimental Feature Warning';
                wipModalMessage.textContent = "You're about to visit an experimental page that is in active development. This feature is not ready for release and might not be fully functional. You may encounter bugs, incomplete content, or other issues.";

                // Set up buttons for experimental warning
                wipModalButtons.innerHTML = `
                    <button class="wip-modal-button wip-modal-button-secondary" id="wipModalCancel">Cancel</button>
                    <button class="wip-modal-button wip-modal-button-primary" id="wipModalVisit">Visit Page</button>
                `;

                // Add event listeners for the new buttons
                const cancelBtn = document.getElementById('wipModalCancel');
                const visitBtn = document.getElementById('wipModalVisit');

                // Remove any existing listeners to prevent duplicates
                cancelBtn.replaceWith(cancelBtn.cloneNode(true));
                visitBtn.replaceWith(visitBtn.cloneNode(true));

                // Add fresh event listeners
                document.getElementById('wipModalCancel').addEventListener('click', closeWipModal, {
                    once: true
                });
                document.getElementById('wipModalVisit').addEventListener('click', function() {
                    // Navigate to the page
                    window.location.href = href;
                }, {
                    once: true
                });
            } else {
                // Show standard WIP modal
                wipModalTitle.textContent = 'Work In Progress';
                wipModalMessage.textContent = 'This feature is currently in development and not yet available. Stay tuned for its release!';

                // Set up buttons for standard WIP modal
                wipModalButtons.innerHTML = `
                    <button class="wip-modal-button wip-modal-button-primary" id="wipModalGotIt">Got it!</button>
                `;

                // Add event listener for Got It button
                const gotItBtn = document.getElementById('wipModalGotIt');
                gotItBtn.replaceWith(gotItBtn.cloneNode(true));
                document.getElementById('wipModalGotIt').addEventListener('click', closeWipModal, {
                    once: true
                });
            }

            // Show the modal
            wipModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Function to close the WIP modal
    function closeWipModal() {
        isModalOpen = false;

        // Use requestAnimationFrame for smoother close animation
        requestAnimationFrame(() => {
            wipModalOverlay.classList.remove('active');
            document.body.style.overflow = '';

            // Small delay before resetting bypass
            setTimeout(() => {
                bypassActive = false;
                document.body.classList.remove('bypass-active');
            }, 300);
        });
    }

    // Close modal when clicking on overlay (outside modal)
    wipModalOverlay.addEventListener('click', function(e) {
        if (e.target === wipModalOverlay) {
            closeWipModal();
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isModalOpen) {
            closeWipModal();
        }
    });

    // Optimized function to handle WIP element clicks
    function handleWipClick(e) {
        const href = this.getAttribute('href');
        showWipModal(e, href, true);
    }

    // Find all elements with WIP class and add click handlers
    function initializeWipElements() {
        const wipElements = document.querySelectorAll('.wip');

        wipElements.forEach(element => {
            // Remove existing listeners to prevent duplicates
            element.removeEventListener('click', handleWipClick);

            // Check if element is a link or has an href attribute
            if (element.tagName === 'A' && element.getAttribute('href')) {
                element.addEventListener('click', handleWipClick);
            }
            // Check if element is a button that might navigate
            else if (element.tagName === 'BUTTON' && (element.onclick || element.getAttribute('onclick'))) {
                element.addEventListener('click', function(e) {
                    showWipModal(e, '', true);
                });
            }
            // For other elements, check if they have a data-href attribute
            else if (element.getAttribute('data-href')) {
                element.addEventListener('click', function(e) {
                    const href = this.getAttribute('data-href');
                    showWipModal(e, href, true);
                });
            }
        });
    }

    // Initialize WIP elements
    initializeWipElements();

    // Throttled re-initialization when DOM changes
    let mutationTimeout;
    const observer = new MutationObserver(function(mutations) {
        // Clear any pending re-initialization
        clearTimeout(mutationTimeout);

        // Schedule re-initialization with a small delay
        mutationTimeout = setTimeout(() => {
            let shouldReinitialize = false;

            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    // Check if any added nodes contain WIP elements
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && (node.classList.contains('wip') || node.querySelector('.wip'))) {
                            shouldReinitialize = true;
                        }
                    });
                }
            });

            if (shouldReinitialize) {
                initializeWipElements();
            }
        }, 100);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Cleanup function to prevent memory leaks
    window.addEventListener('beforeunload', function() {
        observer.disconnect();
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
    });
});