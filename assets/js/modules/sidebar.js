// Sidebar functionality for PCWStats
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar functionality
    const hamburgerBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    // Check if mobile view
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // Track sidebar state
    let isSidebarOpen = false;

    // Create WIP modal elements
    const wipModalOverlay = document.createElement('div');
    wipModalOverlay.className = 'wip-modal-overlay';
    wipModalOverlay.id = 'wipModalOverlay';

    const wipModal = document.createElement('div');
    wipModal.className = 'wip-modal';
    wipModal.id = 'wipModal';
    wipModal.innerHTML = `
        <i class="fas fa-tools wip-modal-icon"></i>
        <h3 class="wip-modal-title">Work In Progress</h3>
        <p class="wip-modal-content">This feature is currently in development and not yet available. Stay tuned for its release!</p>
        <button class="wip-modal-close" id="wipModalClose">Got it!</button>
    `;

    // Create experimental warning modal elements
    const experimentalModalOverlay = document.createElement('div');
    experimentalModalOverlay.className = 'wip-modal-overlay experimental-overlay';
    experimentalModalOverlay.id = 'experimentalModalOverlay';

    const experimentalModal = document.createElement('div');
    experimentalModal.className = 'wip-modal experimental-modal';
    experimentalModal.id = 'experimentalModal';
    experimentalModal.innerHTML = `
        <h3 class="wip-modal-title">Experimental Feature Warning</h3>
        <p class="wip-modal-content">You're about to visit an experimental page that is in active development.
        This feature is not ready for release and might not be fully functional. You may encounter bugs,
        incomplete content, or other issues.</p>
        <div class="experimental-modal-buttons">
            <button class="wip-modal-close experimental-cancel" id="experimentalModalCancel">Cancel</button>
            <button class="wip-modal-close experimental-confirm" id="experimentalModalConfirm">Visit Page</button>
        </div>
    `;

    document.body.appendChild(wipModalOverlay);
    document.body.appendChild(wipModal);
    document.body.appendChild(experimentalModalOverlay);
    document.body.appendChild(experimentalModal);

    const wipModalCloseBtn = document.getElementById('wipModalClose');
    const experimentalModalCancel = document.getElementById('experimentalModalCancel');
    const experimentalModalConfirm = document.getElementById('experimentalModalConfirm');

    function toggleSidebar() {
        if (isSidebarOpen) {
            closeSidebar();
        } else {
            sidebar.style.transition = 'left 0.3s ease';
            overlay.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

            sidebar.classList.add('open');
            overlay.classList.add('open');
            if (hamburgerBtn) hamburgerBtn.classList.add('open');
            document.body.style.overflow = 'hidden';

            // Force reflow to ensure transitions work
            void sidebar.offsetWidth;

            isSidebarOpen = true;
        }
    }

    function closeSidebar() {
        if (!isSidebarOpen) return;

        sidebar.style.transition = 'left 0.3s ease';
        overlay.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        if (hamburgerBtn) hamburgerBtn.classList.remove('open');
        document.body.style.overflow = '';

        isSidebarOpen = false;
    }

    function openWipModal() {
        wipModalOverlay.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
        wipModal.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

        wipModalOverlay.classList.add('open');
        wipModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeWipModal() {
        wipModalOverlay.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
        wipModal.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

        wipModalOverlay.classList.remove('open');
        wipModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    function openExperimentalModal(href) {
        experimentalModalOverlay.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
        experimentalModal.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

        experimentalModalOverlay.classList.add('open');
        experimentalModal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Store the href in the confirm button's data attribute
        experimentalModalConfirm.dataset.href = href;
    }

    function closeExperimentalModal() {
        experimentalModalOverlay.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
        experimentalModal.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

        experimentalModalOverlay.classList.remove('open');
        experimentalModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Click handlers for sidebar
    if (hamburgerBtn && isMobile) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar();
        });
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeSidebar();
        });
    }

    if (overlay && isMobile) {
        overlay.addEventListener('click', closeSidebar);
    }

    // WIP modal close handler
    if (wipModalCloseBtn) {
        wipModalCloseBtn.addEventListener('click', closeWipModal);
    }

    if (wipModalOverlay) {
        wipModalOverlay.addEventListener('click', closeWipModal);
    }

    // Experimental modal handlers
    if (experimentalModalCancel) {
        experimentalModalCancel.addEventListener('click', closeExperimentalModal);
    }

    if (experimentalModalOverlay) {
        experimentalModalOverlay.addEventListener('click', closeExperimentalModal);
    }

    if (experimentalModalConfirm) {
        experimentalModalConfirm.addEventListener('click', function() {
            const href = this.dataset.href;
            if (href) {
                window.location.href = href;
            }
        });
    }

    // Prevent clicks inside sidebar from closing it
    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Prevent clicks inside modals from closing them
    if (wipModal) {
        wipModal.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    if (experimentalModal) {
        experimentalModal.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Close sidebar when clicking outside
    if (isMobile) {
        document.addEventListener('click', function(e) {
            if (isSidebarOpen && sidebar && !sidebar.contains(e.target)) {
                closeSidebar();
            }
        });
    }

    // Close modals on escape key press
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isSidebarOpen && isMobile) {
            closeSidebar();
        }
        if (e.key === 'Escape' && wipModalOverlay.classList.contains('open')) {
            closeWipModal();
        }
        if (e.key === 'Escape' && experimentalModalOverlay.classList.contains('open')) {
            closeExperimentalModal();
        }
    });

    // Handle sidebar links active state and WIP links
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Check if link is WIP
            if (this.classList.contains('wip')) {
                // Check for CTRL+SHIFT bypass
                if (e.ctrlKey && e.shiftKey) {
                    e.preventDefault();
                    openExperimentalModal(this.getAttribute('href'));
                    return;
                }

                e.preventDefault();
                openWipModal();
                return;
            }

            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }

            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Only close sidebar on mobile
            if (isMobile) {
                closeSidebar();
            }
        });
    });

    // Handle window resize
    function handleResize() {
        const newIsMobile = window.matchMedia('(max-width: 768px)').matches;

        if (newIsMobile !== isMobile) {
            // Viewport changed between mobile and desktop
            if (newIsMobile) {
                // Changed to mobile view
                sidebar.classList.remove('open');
                overlay.classList.remove('open');
                if (hamburgerBtn) hamburgerBtn.classList.remove('open');
                document.body.style.overflow = '';
                isSidebarOpen = false;
            } else {
                // Changed to desktop view
                sidebar.classList.remove('open');
                overlay.classList.remove('open');
                if (hamburgerBtn) hamburgerBtn.classList.remove('open');
                document.body.style.overflow = '';
                isSidebarOpen = false;
            }
        }
    }

    window.addEventListener('resize', handleResize);
});