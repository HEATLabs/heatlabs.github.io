// Theme functionality + Easter Egg for HEAT Labs with Chart.js support
document.addEventListener('DOMContentLoaded', function() {
    // Constants for Easter Egg
    const MAX_TOGGLES = 10;
    const TOGGLE_TIMEOUT = 5000; // 5 seconds
    const LOCKOUT_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    // State variables
    let toggleCount = 0;
    let toggleTimer = null;
    let isLocked = false;

    const html = document.documentElement;

    // Check lockout
    const darkModeLockout = localStorage.getItem('darkModeLockout');
    if (darkModeLockout) {
        const lockoutTime = parseInt(darkModeLockout);
        if (Date.now() < lockoutTime) {
            isLocked = true;
            forceDarkMode();
        } else {
            localStorage.removeItem('darkModeLockout');
        }
    }

    // Initialize theme - set dark mode as default
    if (!localStorage.getItem('theme')) {
        html.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    } else {
        const savedTheme = localStorage.getItem('theme');
        html.classList.add(savedTheme);
    }

    // Theme toggle function with Easter Egg logic
    function handleThemeToggle() {
        if (isLocked) {
            showLockoutModal();
            return;
        }

        const isDark = html.classList.contains('dark-theme');
        if (isDark) {
            html.classList.remove('dark-theme');
            html.classList.add('light-theme');
            localStorage.setItem('theme', 'light-theme');
        } else {
            html.classList.remove('light-theme');
            html.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        }

        // Update charts when theme changes
        updateChartColors();

        // Dispatch event for other components to listen to
        document.dispatchEvent(new CustomEvent('themeChanged'));

        toggleCount++;
        clearTimeout(toggleTimer);
        toggleTimer = setTimeout(() => toggleCount = 0, TOGGLE_TIMEOUT);

        if (toggleCount >= MAX_TOGGLES) {
            triggerEasterEgg();
        }
    }

    // Force dark mode and update icon
    function forceDarkMode() {
        html.classList.remove('light-theme');
        html.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
        updateChartColors();
    }

    // Update chart colors when theme changes
    function updateChartColors() {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');

        // Get all Chart.js instances on the page
        const charts = Chart.instances;

        // Update each chart
        Object.values(charts).forEach(chart => {
            if (chart.options && chart.options.scales) {
                // Update axis colors
                if (chart.options.scales.x) {
                    chart.options.scales.x.grid.color = gridColor;
                    chart.options.scales.x.ticks.color = textColor;
                }
                if (chart.options.scales.y) {
                    chart.options.scales.y.grid.color = gridColor;
                    chart.options.scales.y.ticks.color = textColor;
                }

                // Update title and legend colors
                if (chart.options.plugins) {
                    if (chart.options.plugins.title) {
                        chart.options.plugins.title.color = textColor;
                    }
                    if (chart.options.plugins.legend) {
                        chart.options.plugins.legend.labels.color = textColor;
                    }
                }

                chart.update();
            }
        });
    }

    // Trigger the Easter Egg
    function triggerEasterEgg() {
        toggleCount = 0;
        clearTimeout(toggleTimer);
        isLocked = true;

        const lockoutUntil = Date.now() + LOCKOUT_DURATION;
        localStorage.setItem('darkModeLockout', lockoutUntil.toString());

        forceDarkMode();
        showLockoutModal(true);
    }

    // Show the modal with the punishment message
    function showLockoutModal(isInitial = false) {
        let modal = document.getElementById('easterEggModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'easterEggModal';
            modal.className = 'easter-egg-modal';

            const content = document.createElement('div');
            content.className = 'easter-egg-modal-content';

            const header = document.createElement('div');
            header.className = 'easter-egg-modal-header';

            const closeBtn = document.createElement('span');
            closeBtn.className = 'easter-egg-modal-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.onclick = () => modal.style.display = 'none';

            const body = document.createElement('div');
            body.className = 'easter-egg-modal-body';

            body.innerHTML = `
                <div class="easter-egg-icon">⚠️</div>
                <div class="easter-egg-title">Alright, That's it</div>
                <div class="easter-egg-message">
                    You lost your dark-mode privileges, please come back in 24 hours to regain access to dark mode<br><br>
                    Come back after the timer below reaches zero to regain your dark-mode privileges<br><br>
                    <span class="easter-egg-timer">${getRemainingTimeString()}</span>
                </div>
            `;

            header.appendChild(closeBtn);
            content.appendChild(header);
            content.appendChild(body);
            modal.appendChild(content);
            document.body.appendChild(modal);

            const style = document.createElement('style');
            style.textContent = `
                .easter-egg-modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                    background-color: rgba(0,0,0,0.7);
                    animation: fadeIn 0.4s;
                }
                .easter-egg-modal-content {
                    position: relative;
                    background-color: var(--bg-dark);
                    color: var(--text-dark);
                    margin: 20% auto;
                    padding: 10px;
                    border: 1px solid var(--accent-color);
                    border-radius: 10px;
                    width: 80%;
                    max-width: 500px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    animation: slideIn 0.5s;
                }
                .easter-egg-modal-header {
                    text-align: right;
                }
                .easter-egg-modal-close {
                    color: var(--text-dark-secondary);
                    font-size: 28px;
                    margin-right: 10px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .easter-egg-modal-close:hover {
                    color: var(--accent-color);
                }
                .easter-egg-modal-body {
                    padding: 20px;
                    text-align: center;
                }
                .easter-egg-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                .easter-egg-title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                .easter-egg-message {
                    font-size: 16px;
                    line-height: 1.5;
                    margin-bottom: 50px;
                }
                @keyframes fadeIn {
                    from {opacity: 0}
                    to {opacity: 1}
                }
                @keyframes slideIn {
                    from {top: -300px; opacity: 0}
                    to {top: 0; opacity: 1}
                }
            `;
            document.head.appendChild(style);
        }

        const message = modal.querySelector('.easter-egg-message .easter-egg-timer');
        if (message) message.textContent = getRemainingTimeString();
        modal.style.display = 'block';
    }

    function getRemainingTimeString() {
        const lockoutTime = parseInt(localStorage.getItem('darkModeLockout'));
        const remaining = Math.max(0, lockoutTime - Date.now());
        const hrs = Math.floor(remaining / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        return `Time left: ${hrs}h ${mins}m`;
    }

    // Initialize chart colors on first load
    setTimeout(updateChartColors, 500);

    // Listen for theme changes from settings
    document.addEventListener('themeChanged', updateChartColors);
});