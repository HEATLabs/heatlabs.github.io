// Sidebar functionality for PCWStats
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar functionality
    const hamburgerBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    // Track sidebar state
    let isSidebarOpen = false;

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

    // Prevent clicks inside sidebar from closing it
    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
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
    });

    // Handle sidebar links active state
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }

            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            closeSidebar();
        });
    });
});