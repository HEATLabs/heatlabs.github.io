// Main JS for PCWStats
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    const html = document.documentElement;

    // Initialize theme icons based on current theme
    updateThemeIcon(html.classList.contains('dark-theme'));

    // Theme toggle click handler
    function toggleTheme() {
        const isDark = html.classList.contains('dark-theme');
        if (isDark) {
            html.classList.remove('dark-theme');
            html.classList.add('light-theme');
            localStorage.setItem('theme', 'light-theme');
            updateThemeIcon(false);
        } else {
            html.classList.remove('light-theme');
            html.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
            updateThemeIcon(true);
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }

    function updateThemeIcon(isDark) {
        const themeIconMobile = themeToggleMobile ? themeToggleMobile.querySelector('i') : null;

        if (themeIconMobile) {
            themeIconMobile.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

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

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

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

    // Initialize interactive elements
    initializeInteractiveElements();
});

function initializeInteractiveElements() {
    // Add animation to feature cards and tank cards when they come into view
    const featureCards = document.querySelectorAll('.feature-card');
    const tankCards = document.querySelectorAll('.tank-card');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        featureCards.forEach(card => {
            observer.observe(card);
        });

        tankCards.forEach(card => {
            observer.observe(card);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        featureCards.forEach(card => {
            card.classList.add('animated');
        });
        tankCards.forEach(card => {
            card.classList.add('animated');
        });
    }
}