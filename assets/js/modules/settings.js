document.addEventListener('DOMContentLoaded', function() {
    // Create settings modal HTML structure
    const settingsModalHTML = `
        <div class="settings-overlay" id="settingsOverlay"></div>
        <div class="settings-modal" id="settingsModal">
            <div class="settings-header">
                <h2 class="settings-title">Site Settings</h2>
                <button class="settings-close-btn" id="settingsCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="settings-group">
                <h3 class="settings-group-title">
                    <i class="fas fa-palette"></i>
                    Appearance
                </h3>

                <div class="settings-option">
                    <div>
                        <div class="settings-label">Theme</div>
                        <div class="settings-description">Choose between light, dark or system default</div>
                    </div>
                    <select class="settings-select" id="themeSelect">
                        <option value="system">System Default</option>
                        <option value="dark">Dark Theme</option>
                        <option value="light">Light Theme</option>
                    </select>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="settings-label">Reduced Motion</div>
                        <div class="settings-description">Reduce animations and transitions</div>
                    </div>
                    <label class="settings-toggle">
                        <input type="checkbox" id="reducedMotionToggle">
                        <span class="settings-toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div class="settings-group">
                <h3 class="settings-group-title">
                    <i class="fas fa-search"></i>
                    Search
                </h3>

                <div class="settings-option">
                    <div>
                        <div class="settings-label">Clear Search History</div>
                        <div class="settings-description">Remove all your past search queries</div>
                    </div>
                    <button class="settings-btn settings-btn-secondary" id="clearSearchHistoryBtn">
                        Clear History
                    </button>
                </div>
            </div>

            <div class="settings-footer">
                <button class="settings-btn settings-btn-secondary" id="settingsCancelBtn">
                    Cancel
                </button>
                <button class="settings-btn settings-btn-primary" id="settingsSaveBtn">
                    Save Changes
                </button>
            </div>
        </div>

        <!-- Toast Notification -->
        <div id="toast" class="toast">
            <i class="fas fa-check-circle"></i>
            <span id="toast-message">Settings saved successfully!</span>
        </div>
    `;

    // Insert the modal into DOM
    document.body.insertAdjacentHTML('beforeend', settingsModalHTML);

    // Get DOM elements
    const settingsModal = document.getElementById('settingsModal');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const settingsCloseBtn = document.getElementById('settingsCloseBtn');
    const settingsCancelBtn = document.getElementById('settingsCancelBtn');
    const settingsSaveBtn = document.getElementById('settingsSaveBtn');
    const clearSearchHistoryBtn = document.getElementById('clearSearchHistoryBtn');
    const themeSelect = document.getElementById('themeSelect');
    const reducedMotionToggle = document.getElementById('reducedMotionToggle');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // Open settings modal when clicking settings button
    const openSettingsBtn = document.getElementById('openSettings');
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', openSettingsModal);
    }

    // Keyboard listener for "settings" command
    let typedKeys = '';
    document.addEventListener('keydown', function(e) {
        // Only track letters
        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            typedKeys += e.key.toLowerCase();

            // Check if "settings" has been typed
            if (typedKeys.includes('settings')) {
                openSettingsModal();
                typedKeys = ''; // Reset after opening
            }

            // Limit the length to prevent memory issues
            if (typedKeys.length > 20) {
                typedKeys = typedKeys.slice(-20);
            }
        }
    });

    // Show toast notification
    function showToast(message, type = 'success') {
        toast.className = 'toast';
        toast.classList.add(type);
        toastMessage.textContent = message;

        // Set appropriate icon based on type
        const icon = toast.querySelector('i');
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
        } else {
            icon.className = 'fas fa-info-circle';
        }

        toast.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');

            // Remove hide class after animation completes
            setTimeout(() => {
                toast.classList.remove('hide');
            }, 300);
        }, 3000);
    }

    // Open settings modal
    function openSettingsModal() {
        settingsModal.classList.add('active');
        settingsOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Load saved settings
        const savedTheme = localStorage.getItem('themePreference') || 'system';
        const savedMotion = localStorage.getItem('reducedMotion') === 'true';

        themeSelect.value = savedTheme;
        reducedMotionToggle.checked = savedMotion;
    }

    // Close settings modal
    function closeSettingsModal() {
        settingsModal.classList.remove('active');
        settingsOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Save settings
    function saveSettings() {
        const theme = themeSelect.value;
        const reducedMotion = reducedMotionToggle.checked;

        // Save to localStorage
        localStorage.setItem('themePreference', theme);
        localStorage.setItem('reducedMotion', reducedMotion);

        // Apply theme
        applyThemePreference(theme);

        // Apply reduced motion
        if (reducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        } else {
            document.documentElement.classList.remove('reduced-motion');
        }

        // Show success toast
        showToast('Settings saved successfully!', 'success');

        // Close modal after a short delay to allow toast to be seen
        setTimeout(closeSettingsModal, 500);
    }

    // Apply theme preference
    function applyThemePreference(theme) {
        const html = document.documentElement;

        // Remove existing theme classes
        html.classList.remove('dark-theme', 'light-theme');

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                html.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark-theme');
            } else {
                html.classList.add('light-theme');
                localStorage.setItem('theme', 'light-theme');
            }
        } else if (theme === 'dark') {
            html.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        } else {
            html.classList.add('light-theme');
            localStorage.setItem('theme', 'light-theme');
        }

        // Dispatch event for other components to listen to
        document.dispatchEvent(new CustomEvent('themeChanged'));
    }

    // Clear search history
    function clearSearchHistory() {
        localStorage.removeItem('pastSearches');

        // Update search.js if it's loaded
        if (typeof updatePastSearchesDisplay === 'function') {
            updatePastSearchesDisplay();
        }

        // Show info toast
        showToast('Search history cleared!', 'info');
    }

    // Initialize settings on page load
    function initializeSettings() {
        // Check for reduced motion preference
        const reducedMotion = localStorage.getItem('reducedMotion') === 'true';
        if (reducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        }

        // Check for theme preference
        const themePreference = localStorage.getItem('themePreference') || 'system';
        applyThemePreference(themePreference);
    }

    // Event listeners
    settingsCloseBtn.addEventListener('click', closeSettingsModal);
    settingsOverlay.addEventListener('click', closeSettingsModal);
    settingsCancelBtn.addEventListener('click', closeSettingsModal);
    settingsSaveBtn.addEventListener('click', saveSettings);
    clearSearchHistoryBtn.addEventListener('click', clearSearchHistory);

    settingsModal.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Initialize settings when page loads
    initializeSettings();
});