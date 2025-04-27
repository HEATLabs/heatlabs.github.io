// Theme functionality for PCWStats
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
});