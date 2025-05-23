// Sidebar functionality for PCWStats
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar functionality
    const hamburgerBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

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

    document.body.appendChild(wipModalOverlay);
    document.body.appendChild(wipModal);

    const wipModalCloseBtn = document.getElementById('wipModalClose');

    function openSidebar() {
        if (isSidebarOpen) return;

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

    // Click handlers for sidebar
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openSidebar();
        });
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeSidebar();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // WIP modal close handler
    if (wipModalCloseBtn) {
        wipModalCloseBtn.addEventListener('click', closeWipModal);
    }

    if (wipModalOverlay) {
        wipModalOverlay.addEventListener('click', closeWipModal);
    }

    // Prevent clicks inside sidebar from closing it
    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Prevent clicks inside WIP modal from closing it
    if (wipModal) {
        wipModal.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (isSidebarOpen && sidebar && !sidebar.contains(e.target)) {
            closeSidebar();
        }
    });

    // Close sidebar on escape key press
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isSidebarOpen) {
            closeSidebar();
        }
        if (e.key === 'Escape' && wipModalOverlay.classList.contains('open')) {
            closeWipModal();
        }
    });

    // Handle sidebar links active state and WIP links
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Check if link is WIP
            if (this.classList.contains('wip')) {
                e.preventDefault();
                openWipModal();
                return;
            }

            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }

            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            closeSidebar();
        });
    });
});