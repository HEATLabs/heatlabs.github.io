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
                    <i class="fas fa-ruler-combined"></i>
                    Units
                </h3>

                <div class="settings-option">
                    <div>
                        <div class="settings-label">Unit System</div>
                        <div class="settings-description">Display measurements in metric or imperial units</div>
                    </div>
                    <select class="settings-select" id="unitSystemSelect">
                        <option value="metric">Metric (km/h, m)</option>
                        <option value="imperial">Imperial (mph, ft)</option>
                    </select>
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

    // Open settings modal
    function openSettingsModal() {
        settingsModal.classList.add('active');
        settingsOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Load saved settings (mock data)
        document.getElementById('themeSelect').value = 'system';
        document.getElementById('reducedMotionToggle').checked = false;
        document.getElementById('unitSystemSelect').value = 'metric';
    }

    // Close settings modal
    function closeSettingsModal() {
        settingsModal.classList.remove('active');
        settingsOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Save settings (mock function)
    function saveSettings() {
        const theme = document.getElementById('themeSelect').value;
        const reducedMotion = document.getElementById('reducedMotionToggle').checked;
        const unitSystem = document.getElementById('unitSystemSelect').value;

        // In a real implementation, these will be saved to localStorage when ill finish this
        console.log('Settings saved:', {
            theme,
            reducedMotion,
            unitSystem
        });

        // Show a success message, this will be a toast notification
        alert('Settings saved successfully!');
        closeSettingsModal();
    }

    // Clear search history (mock function)
    function clearSearchHistory() {
        alert('Search history cleared! (This is a mock action)');
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
});