document.addEventListener('DOMContentLoaded', function() {
    // Prevent multi initialization
    if (document.getElementById('settingsModal')) {
        return; // Already initialized
    }
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
                    <select class="settings-select" id="reducedMotionSelect">
                        <option value="false">Disabled</option>
                        <option value="true">Enabled</option>
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

            <div class="settings-group">
                <h3 class="settings-group-title">
                    <i class="fas fa-database"></i>
                    Data Management
                </h3>

                <div class="settings-option">
                    <div>
                        <div class="settings-label">Data Retention</div>
                        <div class="settings-description">How long we store your local data</div>
                    </div>
                    <select class="settings-select" id="dataRetentionSelect">
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                        <option value="0">Forever</option>
                    </select>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="settings-label">Export All Data</div>
                        <div class="settings-description">Download a copy of all your stored data</div>
                    </div>
                    <button class="settings-btn settings-btn-secondary" id="exportDataBtn">
                        Export Data
                    </button>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="settings-label">Erase All Data</div>
                        <div class="settings-description">Permanently delete all your stored data</div>
                    </div>
                    <button class="settings-btn settings-btn-danger" id="eraseDataBtn">
                        Erase Data
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

        <!-- Confirmation Modal -->
        <div class="confirmation-overlay" id="confirmationOverlay"></div>
        <div class="confirmation-modal" id="confirmationModal">
            <div class="confirmation-content">
                <h3 id="confirmationTitle">Confirm Action</h3>
                <p id="confirmationMessage">Are you sure you want to perform this action?</p>
                <div class="confirmation-buttons">
                    <button class="settings-btn settings-btn-secondary" id="confirmationCancelBtn">Cancel</button>
                    <button class="settings-btn settings-btn-danger" id="confirmationConfirmBtn">Confirm</button>
                </div>
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
    const themeSelect = document.getElementById('themeSelect');
    const reducedMotionSelect = document.getElementById('reducedMotionSelect');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const dataRetentionSelect = document.getElementById('dataRetentionSelect');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const eraseDataBtn = document.getElementById('eraseDataBtn');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationOverlay = document.getElementById('confirmationOverlay');
    const confirmationCancelBtn = document.getElementById('confirmationCancelBtn');
    const confirmationConfirmBtn = document.getElementById('confirmationConfirmBtn');
    const confirmationTitle = document.getElementById('confirmationTitle');
    const confirmationMessage = document.getElementById('confirmationMessage');

    // Open settings modal when clicking settings button
    const openSettingsBtn = document.getElementById('openSettings');
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', openSettingsModal);
    }

    // Show toast notification
    function showToast(message, type = 'success') {
        toast.className = 'toast';
        toast.classList.add(type);
        toastMessage.textContent = message;

        // Set appropriate icon based on type
        const icon = toast.querySelector('i');
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
        } else if (type === 'info') {
            icon.className = 'fas fa-info-circle';
        } else if (type === 'warning') {
            icon.className = 'fas fa-exclamation-circle';
        } else {
            icon.className = 'fas fa-times-circle';
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

    // Show confirmation modal
    function showConfirmation(title, message, confirmCallback) {
        confirmationTitle.textContent = title;
        confirmationMessage.textContent = message;
        confirmationModal.classList.add('active');
        confirmationOverlay.classList.add('active');

        const handleConfirm = () => {
            confirmationModal.classList.remove('active');
            confirmationOverlay.classList.remove('active');
            confirmCallback();
            confirmationConfirmBtn.removeEventListener('click', handleConfirm);
        };

        confirmationConfirmBtn.addEventListener('click', handleConfirm);
    }

    // Close confirmation modal
    function closeConfirmationModal() {
        confirmationModal.classList.remove('active');
        confirmationOverlay.classList.remove('active');
    }

    // Open settings modal
    function openSettingsModal() {
        settingsModal.classList.add('active');
        settingsOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Load saved settings
        const savedTheme = localStorage.getItem('themePreference') || 'system';
        const savedMotion = localStorage.getItem('reducedMotion') === 'true';
        const savedRetention = localStorage.getItem('dataRetention') || '3';

        themeSelect.value = savedTheme;
        reducedMotionSelect.value = savedMotion;
        dataRetentionSelect.value = savedRetention;
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
        const reducedMotion = reducedMotionSelect.value === 'true';
        const dataRetention = dataRetentionSelect.value;

        // Save to localStorage
        localStorage.setItem('themePreference', theme);
        localStorage.setItem('reducedMotion', reducedMotion);
        localStorage.setItem('dataRetention', dataRetention);

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

    // Track export state to prevent multiple downloads
    let isExporting = false;
    let exportClickHandler = null;

    // Export all data
    function exportAllData() {
        // Prevent multiple clicks
        if (isExporting) return;
        isExporting = true;

        const exportData = {
            exportInfo: {
                exportDate: new Date().toISOString(),
                source: 'HEAT Labs Data Export',
                description: 'This export offers a simple, one-click view of the data that HEAT Labs stores locally in your browser. For transparency: this data is completely private. It has always been stored exclusively on your device, and HEAT Labs cannot access, analyze, or transmit it in any way. It is not shared between devices unless your browser specifically syncs such data and you enabled that feature. This tool exists purely to let you see the information your browser uses to keep HEAT Labs functioning correctly.'
            },
            userData: {
                // App Settings
                settings: {},
                // Search Related Data
                searchData: {},
                // Other Application Data
                appData: {},
                // Temporary Session Data
                sessionData: {}
            },
            statistics: {
                totalItems: 0,
                localStorageItems: 0,
                sessionStorageItems: 0,
                categories: {
                    settings: 0,
                    searchData: 0,
                    appData: 0,
                    sessionData: 0
                }
            }
        };

        let totalItems = 0;
        let localStorageCount = 0;
        let sessionStorageCount = 0;

        // Process localStorage data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);

            // Categorize the data based on key patterns
            if (key.includes('theme') || key.includes('Motion') || key.includes('Retention') || key.includes('Preference')) {
                exportData.userData.settings[key] = value;
                exportData.statistics.categories.settings++;
            } else if (key.includes('search') || key.includes('Search') || key.includes('query') || key.includes('history')) {
                exportData.userData.searchData[key] = value;
                exportData.statistics.categories.searchData++;
            } else {
                exportData.userData.appData[key] = value;
                exportData.statistics.categories.appData++;
            }

            localStorageCount++;
            totalItems++;
        }

        // Process sessionStorage data
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            const value = sessionStorage.getItem(key);

            exportData.userData.sessionData[key] = value;
            exportData.statistics.categories.sessionData++;
            sessionStorageCount++;
            totalItems++;
        }

        // Update statistics
        exportData.statistics.totalItems = totalItems;
        exportData.statistics.localStorageItems = localStorageCount;
        exportData.statistics.sessionStorageItems = sessionStorageCount;

        // Create a single comprehensive JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(dataBlob);

        // Create and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `heatlabs-data-export-${new Date().toISOString().split('T')[0]}.json`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            isExporting = false;
        }, 100);

        // Show detailed success message
        const itemCount = totalItems > 0 ? ` (${totalItems} items)` : '';
        showToast(`Data exported successfully${itemCount}!`, 'success');
    }

    // Erase all data
    function eraseAllData() {
        showConfirmation(
            'Erase All Data',
            'This will permanently delete all your stored data including preferences, search history, and other settings. This action cannot be undone.',
            () => {
                localStorage.clear();
                sessionStorage.clear();

                // Reinitialize default settings
                initializeSettings();

                showToast('All data has been erased!', 'info');

                // Close settings modal if open
                closeSettingsModal();
            }
        );
    }

    // Check and clean expired data
    function checkDataExpiration() {
        const retentionMonths = parseInt(localStorage.getItem('dataRetention') || '3');
        if (retentionMonths === 0) return; // Forever option

        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() - retentionMonths);

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key === 'themePreference' || key === 'reducedMotion' || key === 'dataRetention') continue;

            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item && item.timestamp) {
                    const itemDate = new Date(item.timestamp);
                    if (itemDate < expirationDate) {
                        localStorage.removeItem(key);
                    }
                }
            } catch (e) {
                // If not JSON, skip
                continue;
            }
        }
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

        // Set default data retention if not set
        if (!localStorage.getItem('dataRetention')) {
            localStorage.setItem('dataRetention', '3');
        }

        // Check for expired data
        checkDataExpiration();
    }

    // Event listeners
    settingsCloseBtn.addEventListener('click', closeSettingsModal);
    settingsOverlay.addEventListener('click', closeSettingsModal);
    settingsCancelBtn.addEventListener('click', closeSettingsModal);
    settingsSaveBtn.addEventListener('click', saveSettings);
    clearSearchHistoryBtn.addEventListener('click', clearSearchHistory);

    // Ensure only one handler is attached
    if (exportClickHandler) {
        exportDataBtn.removeEventListener('click', exportClickHandler);
    }
    exportClickHandler = exportAllData;
    exportDataBtn.addEventListener('click', exportClickHandler);

    eraseDataBtn.addEventListener('click', eraseAllData);
    confirmationCancelBtn.addEventListener('click', closeConfirmationModal);
    confirmationOverlay.addEventListener('click', closeConfirmationModal);

    settingsModal.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    confirmationModal.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Initialize settings when page loads
    initializeSettings();
});