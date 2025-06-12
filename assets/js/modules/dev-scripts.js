document.addEventListener('DOMContentLoaded', function() {
    // Add hitbox styles function
    function addHitboxStyles() {
        if (!document.getElementById('hitbox-styles')) {
            const style = document.createElement('style');
            style.id = 'hitbox-styles';
            style.textContent = `
                .hitbox-highlight {
                    position: absolute;
                    background: rgba(255, 0, 0, 0.3);
                    border: 2px dashed red;
                    pointer-events: none;
                    z-index: 9999;
                    box-sizing: border-box;
                    border-radius: 3px;
                }
                .hitbox-highlight::after {
                    content: attr(data-type);
                    position: absolute;
                    top: -20px;
                    left: 0;
                    background: red;
                    color: white;
                    font-size: 12px;
                    padding: 2px 5px;
                    border-radius: 3px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Improved element visibility check
    function isElementVisible(el) {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            style.opacity !== '0' &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0 &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
            rect.right >= 0
        );
    }

    // Hitbox Viewer Test
    function runHitboxTest() {
        logTestMessage('Running Hitbox Viewer test...');
        logTestMessage('Highlighting clickable elements...');

        // Clear any existing highlights
        clearHitboxTest();

        // Add the required styles
        addHitboxStyles();

        // Expanded list of interactive elements
        const clickableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[role="button"]',
            '[role="link"]',
            '[tabindex]:not([tabindex="-1"])',
            '[onclick]',
            '[onmousedown]',
            '[onmouseup]',
            '[onkeydown]',
            '[onkeypress]',
            '[onkeyup]',
            '[contenteditable="true"]',
            'label[for]',
            'summary'
        ];

        let elementsHighlighted = 0;

        clickableSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);

            elements.forEach(element => {
                if (element.closest('.web-test') || !isElementVisible(element)) return;

                const rect = element.getBoundingClientRect();
                const highlight = document.createElement('div');
                highlight.className = 'hitbox-highlight';

                // Add element type as data attribute
                highlight.dataset.type = element.tagName.toLowerCase();
                if (element.getAttribute('role')) {
                    highlight.dataset.type += `[role="${element.getAttribute('role')}"]`;
                }

                highlight.style.position = 'absolute';
                highlight.style.left = `${rect.left + window.scrollX}px`;
                highlight.style.top = `${rect.top + window.scrollY}px`;
                highlight.style.width = `${rect.width}px`;
                highlight.style.height = `${rect.height}px`;

                document.body.appendChild(highlight);
                elementsHighlighted++;
            });
        });

        logTestMessage(`Highlighted ${elementsHighlighted} clickable elements on the page`);
        setTestResults(`Clickable elements highlighted: ${elementsHighlighted}`);
        updateTestStatus('green');
    }

    function clearHitboxTest() {
        const highlights = document.querySelectorAll('.hitbox-highlight');
        highlights.forEach(highlight => highlight.remove());
    }

    // Create scripts modal HTML structure
    const scriptsModalHTML = `
        <div class="scripts-overlay" id="scriptsOverlay"></div>
        <div class="scripts-modal" id="scriptsModal">
            <div class="scripts-header">
                <h2 class="scripts-title">Dev Scripts</h2>
                <button class="scripts-close-btn" id="scriptsCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="scripts-group">
                <h3 class="scripts-group-title">
                    <i class="fas fa-palette"></i>
                    Web Test
                </h3>

                <div class="scripts-option">
                    <div>
                        <div class="scripts-label">Hitbox</div>
                        <div class="scripts-description">Show Hitboxes</div>
                    </div>
                    <label class="scripts-toggle">
                        <input type="checkbox" id="hitboxToggle">
                        <span class="scripts-toggle-slider"></span>
                    </label>
                </div>
            </div>

<!--            <div class="scripts-group">-->
<!--                <h3 class="scripts-group-title">-->
<!--                    <i class="fas fa-ruler-combined"></i>-->
<!--                    Units-->
<!--                </h3>-->

<!--                <div class="scripts-option">-->
<!--                    <div>-->
<!--                        <div class="scripts-label">Unit System</div>-->
<!--                        <div class="scripts-description">Display measurements in metric or imperial units</div>-->
<!--                    </div>-->
<!--                    <select class="scripts-select" id="unitSystemSelect">-->
<!--                        <option value="metric">Metric (km/h, m)</option>-->
<!--                        <option value="imperial">Imperial (mph, ft)</option>-->
<!--                    </select>-->
<!--                </div>-->
<!--            </div>-->

<!--            <div class="scripts-group">-->
<!--                <h3 class="scripts-group-title">-->
<!--                    <i class="fas fa-search"></i>-->
<!--                    Search-->
<!--                </h3>-->

<!--                <div class="scripts-option">-->
<!--                    <div>-->
<!--                        <div class="scripts-label">Clear Search History</div>-->
<!--                        <div class="scripts-description">Remove all your past search queries</div>-->
<!--                    </div>-->
<!--                    <button class="scripts-btn scripts-btn-secondary" id="clearSearchHistoryBtn">-->
<!--                        Clear History-->
<!--                    </button>-->
<!--                </div>-->
<!--            </div>-->

            <div class="scripts-footer">
                <button class="scripts-btn scripts-btn-secondary" id="scriptsCancelBtn">
                    Cancel
                </button>
                <button class="scripts-btn scripts-btn-primary" id="scriptsSaveBtn">
                    Save Changes
                </button>
            </div>
        </div>
    `;

    // Insert the modal into DOM
    document.body.insertAdjacentHTML('beforeend', scriptsModalHTML);

    // Get DOM elements
    const scriptsModal = document.getElementById('scriptsModal');
    const scriptsOverlay = document.getElementById('scriptsOverlay');
    const scriptsCloseBtn = document.getElementById('scriptsCloseBtn');
    const scriptsCancelBtn = document.getElementById('scriptsCancelBtn');
    const scriptsSaveBtn = document.getElementById('scriptsSaveBtn');
    const clearSearchHistoryBtn = document.getElementById('clearSearchHistoryBtn');
    const hitboxToggle = document.getElementById('hitboxToggle');

    // Setup hitbox toggle
    if (hitboxToggle) {
        hitboxToggle.addEventListener('change', function(e) {
            if (e.target.checked) {
                runHitboxTest();
            } else {
                clearHitboxTest();
            }
        });
    }

    // Keyboard listener for "scripts" command
    let typedKeys = '';
    document.addEventListener('keydown', function(e) {
        // Only track letters
        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            typedKeys += e.key.toLowerCase();

            // Check if "scripts" has been typed
            if (typedKeys.includes('scripts')) {
                openSettingsModal();
                typedKeys = ''; // Reset after opening
            }

            // Limit the length to prevent memory issues
            if (typedKeys.length > 20) {
                typedKeys = typedKeys.slice(-20);
            }
        }
    });

    // Open scripts modal
    function openSettingsModal() {
        scriptsModal.classList.add('active');
        scriptsOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Load saved settings
        document.getElementById('hitboxToggle').checked = false;
        document.getElementById('unitSystemSelect').value = 'metric';
    }

    // Close scripts modal
    function closeSettingsModal() {
        scriptsModal.classList.remove('active');
        scriptsOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Save scripts
    function saveSettings() {
        const unitSystem = document.getElementById('unitSystemSelect').value;
        const hitboxEnabled = document.getElementById('hitboxToggle').checked;

        console.log('Settings saved:', {
            unitSystem,
            hitboxEnabled
        });

        alert('Settings saved successfully!');
        closeSettingsModal();
    }

    // Clear search history
    function clearSearchHistory() {
        alert('Search history cleared! (This is a mock action)');
    }

    // Event listeners
    scriptsCloseBtn.addEventListener('click', closeSettingsModal);
    scriptsOverlay.addEventListener('click', closeSettingsModal);
    scriptsCancelBtn.addEventListener('click', closeSettingsModal);
    scriptsSaveBtn.addEventListener('click', saveSettings);
    clearSearchHistoryBtn.addEventListener('click', clearSearchHistory);
    scriptsModal.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Mock functions (replace with your actual implementations)
    function logTestMessage(message) {
        console.log(message);
    }

    function setTestResults(message) {
        console.log(message);
    }

    function updateTestStatus(color) {
        console.log(`Status updated to ${color}`);
    }
});