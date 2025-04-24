// Main JS for PCWStats
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    const body = document.body;

    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.className = savedTheme;
        updateThemeIcon(savedTheme === 'dark-theme');
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            body.className = 'dark-theme';
            updateThemeIcon(true);
        }
    }

    // Theme toggle click handler
    function toggleTheme() {
        const isDark = body.classList.contains('dark-theme');
        if (isDark) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light-theme');
            updateThemeIcon(false);
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
            updateThemeIcon(true);
        }
    }

    themeToggle.addEventListener('click', toggleTheme);
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

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('open');
        if (hamburgerBtn) hamburgerBtn.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        if (hamburgerBtn) hamburgerBtn.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', openSidebar);
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }

    overlay.addEventListener('click', closeSidebar);

    // Close sidebar when clicking outside on desktop
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && e.target !== hamburgerBtn) {
            closeSidebar();
        }
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
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