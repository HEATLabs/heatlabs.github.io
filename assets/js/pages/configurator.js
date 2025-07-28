document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const fileInputBtn = document.getElementById('fileInputBtn');
    const dropZone = document.getElementById('dropZone');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const resetFile = document.getElementById('resetFile');
    const configSections = document.getElementById('configSections');
    const saveConfig = document.getElementById('saveConfig');
    const downloadConfig = document.getElementById('downloadConfig');
    const resetAll = document.getElementById('resetAll');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Current config data
    let configData = null;
    let originalConfig = null;
    let fileNameValue = '';

    // Default values
    const defaultValues = {
        aiming: {
            "aimAssistSensitivityMultiplierAt500M": 0.5,
            "aimAssistSensitivityMultiplierAtZeroM": 0.5,
            "aimAssistTargetLockOnTime": 0.0,
            "distanceUpdateSpeed": 30.0,
            "maxAimingAngleError": 25.0,
            "maxDistance": 2000.0,
            "minDistance": 35.0,
            "stopType": "StopByRotation",
            "useLocalAimPoint": true,
            "useLocalDispersion": true
        },
        followAim: {
            "followAimAccMagnetMin": 0.3,
            "followAimAccMagnetMult": 0.5,
            "followAimCentringTime": 1.0,
            "followAimDecMagnetMin": 0.4,
            "followAimDecMagnetMult": 0.55,
            "followAimMaxMagnetPower": 0.4,
            "followAimMaxTargetDistance": 500.0,
            "followAimMinMagnetDistanceFromCenterPower": 0.3,
            "followAimMinRadiusScalingDistance": 200.0,
            "followAimRotationPullFactor": 0.1,
            "followAimSelectorCenterCoef": 1.5,
            "followAimSelectorCenterMin": 0.5,
            "followAimSelectorDistanceCoef": 0.3,
            "followAimSensitivityFactor": 0.7,
            "followAimTankCentringSize": 40.0,
            "followInnerRadius": 3.5,
            "followRadius": 4.3
        },
        armorOutliner: {
            "Max Distance": 400.0,
            "Is Enabled": true
        },
        haptics: {
            "heavyRumbleDurationMS": 500,
            "heavyRumbleHighFrequency": 0.8,
            "heavyRumbleLowFrequency": 0.8,
            "lightRumbleDurationMS": 300,
            "lightRumbleHighFrequency": 0.3,
            "lightRumbleLowFrequency": 0.3,
            "mediumRumbleDurationMS": 400,
            "mediumRumbleHighFrequency": 0.5,
            "mediumRumbleLowFrequency": 0.5
        },
        window: {
            "minSize": {
                "height": 720,
                "width": 1280
            }
        },
        frameLimiter: {
            "client": {
                "frequency": 250.0,
                "carriedOverspent": 0.4
            },
            "inactive client": {
                "frequency": 30.0,
                "carriedOverspent": 0.4
            }
        },
        resolutionPresets: [{
                "key": "Full HD Fullscreen",
                "value": {
                    "resolution fullscreen": {
                        "height": 1080,
                        "width": 1920
                    }
                }
            },
            {
                "key": "WQ HD Fullscreen",
                "value": {
                    "resolution fullscreen": {
                        "height": 1440,
                        "width": 2560
                    }
                }
            },
            {
                "key": "4K Fullscreen",
                "value": {
                    "resolution fullscreen": {
                        "height": 2160,
                        "width": 3840
                    }
                }
            }
        ],
        breakpoints: [{
                "Height": 0,
                "Scale": 0.6,
                "Width": 0
            },
            {
                "Height": 700,
                "Scale": 0.7,
                "Width": 1200
            },
            {
                "Height": 855,
                "Scale": 0.8,
                "Width": 1600
            },
            {
                "Height": 1035,
                "Scale": 1.0,
                "Width": 1920
            },
            {
                "Height": 1155,
                "Scale": 1.05,
                "Width": 2200
            },
            {
                "Height": 1395,
                "Scale": 1.335,
                "Width": 2560
            },
            {
                "Height": 1395,
                "Scale": 1.2,
                "Width": 3440
            },
            {
                "Height": 2115,
                "Scale": 2.0,
                "Width": 3840
            }
        ],
        markers: {
            "ally": {
                "InDirectVisible": {
                    "opacity": 1.0,
                    "isEnabled": true,
                    "isNameEnabled": true,
                    "isHealthBarEnabled": true,
                    "isDistanceEnabled": true
                }
            },
            "enemy": {
                "InDirectVisible": {
                    "opacity": 1.0,
                    "isEnabled": true,
                    "isNameEnabled": true,
                    "isHealthBarEnabled": true,
                    "isDistanceEnabled": true
                }
            },
            "platoon": {
                "InDirectVisible": {
                    "opacity": 1.0,
                    "isEnabled": true,
                    "isNameEnabled": true,
                    "isHealthBarEnabled": true,
                    "isDistanceEnabled": true
                }
            }
        }
    };

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // Save active tab to localStorage
            localStorage.setItem('activeConfigTab', tabId);
        });
    });

    // Set active tab from localStorage if available
    const savedTab = localStorage.getItem('activeConfigTab');
    if (savedTab) {
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
        if (tabBtn) {
            tabBtn.click();
        }
    }

    // File input button click
    fileInputBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('drag-over');
    }

    function unhighlight() {
        dropZone.classList.remove('drag-over');
    }

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Reset file button
    resetFile.addEventListener('click', () => {
        fileInput.value = '';
        configData = null;
        originalConfig = null;
        fileInfo.style.display = 'none';
        configSections.style.display = 'none';
        dropZone.style.display = 'flex';
    });

    // Save config button
    saveConfig.addEventListener('click', () => {
        if (configData) {
            localStorage.setItem('cwConfigData', JSON.stringify(configData));
            localStorage.setItem('cwConfigFileName', fileNameValue);
            showToast('Settings saved to browser storage!');
        }
    });

    // Download config button
    downloadConfig.addEventListener('click', () => {
        if (configData) {
            const blob = new Blob([JSON.stringify(configData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileNameValue || 'modified_coldwar.project';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });

    // Reset all button
    resetAll.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            resetAllSettings();
        }
    });

    // Handle file upload
    function handleFile(file) {
        if (!file.name.endsWith('.project')) {
            showToast('Please upload a valid .project file');
            return;
        }

        fileNameValue = file.name;
        fileName.textContent = file.name;
        fileInfo.style.display = 'flex';
        dropZone.style.display = 'none';

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                configData = JSON.parse(content);
                originalConfig = JSON.parse(content);

                // Check if this is the new format with "settings" wrapper
                if (configData.settings) {
                    configData = configData.settings;
                }

                // Load settings from localStorage if available
                const savedConfig = localStorage.getItem('cwConfigData');
                if (savedConfig) {
                    try {
                        const parsedSavedConfig = JSON.parse(savedConfig);
                        // Only apply saved settings if the file structure matches
                        if (parsedSavedConfig['cw::AimingProjectSettings'] || parsedSavedConfig.settings) {
                            configData = parsedSavedConfig.settings || parsedSavedConfig;
                            showToast('Previous settings loaded from browser storage');
                        }
                    } catch (e) {
                        console.error('Error loading saved config:', e);
                    }
                }

                renderSettings();
                configSections.style.display = 'block';
            } catch (e) {
                console.error('Error parsing file:', e);
                showToast('Error parsing file. Please make sure it\'s a valid JSON file.');
                resetFile.click();
            }
        };
        reader.readAsText(file);
    }

    // Render all settings
    function renderSettings() {
        if (!configData) return;

        // Aiming Settings
        renderAimingSettings();

        // Follow Aim Settings (Aim Assist)
        renderFollowAimSettings();

        // Armor Outliner Settings
        renderArmorOutlinerSettings();

        // Controller Haptics Settings
        renderHapticsSettings();

        // Marker Settings
        renderMarkerSettings();

        // Window Settings
        renderWindowSettings();

        // Resolution Settings
        renderResolutionSettings();

        // Frame Limiter Settings
        renderFrameLimiterSettings();
    }

    function renderAimingSettings() {
        const tab = document.getElementById('aiming-tab');
        tab.innerHTML = '';

        const aimingSettings = configData['cw::AimingProjectSettings'] || {};

        const group = createSettingsGroup('Aiming Settings');
        tab.appendChild(group);

        // Create settings controls for each aiming property
        createRangeInput(group, 'Aim Assist Sensitivity at 500m', 'aimAssistSensitivityMultiplierAt500M', aimingSettings, 0, 1, 0.01);
        createRangeInput(group, 'Aim Assist Sensitivity at 0m', 'aimAssistSensitivityMultiplierAtZeroM', aimingSettings, 0, 1, 0.01);
        createRangeInput(group, 'Aim Assist Target Lock On Time', 'aimAssistTargetLockOnTime', aimingSettings, 0, 5, 0.1);
        createRangeInput(group, 'Distance Update Speed', 'distanceUpdateSpeed', aimingSettings, 1, 100, 1);
        createRangeInput(group, 'Max Aiming Angle Error', 'maxAimingAngleError', aimingSettings, 1, 90, 1);
        createRangeInput(group, 'Max Distance', 'maxDistance', aimingSettings, 100, 5000, 10);
        createRangeInput(group, 'Min Distance', 'minDistance', aimingSettings, 1, 100, 1);

        // Dropdown for stopType
        const stopTypeOptions = ['StopByRotation', 'StopByDistance', 'StopByTime'];
        createDropdown(group, 'Stop Type', 'stopType', aimingSettings, stopTypeOptions);

        // Checkboxes
        createCheckbox(group, 'Use Local Aim Point', 'useLocalAimPoint', aimingSettings);
        createCheckbox(group, 'Use Local Dispersion', 'useLocalDispersion', aimingSettings);
    }

    function renderFollowAimSettings() {
        const tab = document.getElementById('aim-assist-tab');
        tab.innerHTML = '';

        const followAimSettings = configData['cw::FollowAimSettings'] || {};

        const group = createSettingsGroup('Aim Assist Settings');
        tab.appendChild(group);

        // Create settings controls for each follow aim property
        createRangeInput(group, 'Acceleration Magnet Min', 'followAimAccMagnetMin', followAimSettings, 0, 1, 0.01);
        createRangeInput(group, 'Acceleration Magnet Multiplier', 'followAimAccMagnetMult', followAimSettings, 0, 1, 0.01);
        createRangeInput(group, 'Centring Time', 'followAimCentringTime', followAimSettings, 0, 5, 0.1);
        createRangeInput(group, 'Deceleration Magnet Min', 'followAimDecMagnetMin', followAimSettings, 0, 1, 0.01);
        createRangeInput(group, 'Deceleration Magnet Multiplier', 'followAimDecMagnetMult', followAimSettings, 0, 1, 0.01);
        createRangeInput(group, 'Max Magnet Power', 'followAimMaxMagnetPower', followAimSettings, 0, 1, 0.01);
        createRangeInput(group, 'Max Target Distance', 'followAimMaxTargetDistance', followAimSettings, 100, 1000, 10);
        createRangeInput(group, 'Min Magnet Distance From Center Power', 'followAimMinMagnetDistanceFromCenterPower', followAimSettings, 0, 1, 0.01);
        createRangeInput(group, 'Min Radius Scaling Distance', 'followAimMinRadiusScalingDistance', followAimSettings, 100, 500, 10);
        createRangeInput(group, 'Rotation Pull Factor', 'followAimRotationPullFactor', followAimSettings, 0, 1, 0.01);
        createRangeInput(group, 'Selector Center Coefficient', 'followAimSelectorCenterCoef', followAimSettings, 0, 3, 0.1);
        createRangeInput(group, 'Selector Center Min', 'followAimSelectorCenterMin', followAimSettings, 0, 1, 0.1);
        createRangeInput(group, 'Selector Distance Coefficient', 'followAimSelectorDistanceCoef', followAimSettings, 0, 1, 0.01);
        createRangeInput(group, 'Sensitivity Factor', 'followAimSensitivityFactor', followAimSettings, 0, 1, 0.01);
        createRangeInput(group, 'Tank Centring Size', 'followAimTankCentringSize', followAimSettings, 10, 100, 1);
        createRangeInput(group, 'Follow Inner Radius', 'followInnerRadius', followAimSettings, 1, 10, 0.1);
        createRangeInput(group, 'Follow Radius', 'followRadius', followAimSettings, 1, 10, 0.1);
    }

    function renderArmorOutlinerSettings() {
        const tab = document.getElementById('armor-tab');
        tab.innerHTML = '';

        const armorSettings = configData['cw::ArmorOutlinerProjectSettings'] || {};

        const group = createSettingsGroup('Armor Outliner Settings');
        tab.appendChild(group);

        createRangeInput(group, 'Max Distance', 'Max Distance', armorSettings, 100, 1000, 10);
        createCheckbox(group, 'Enabled', 'Is Enabled', armorSettings);
    }

    function renderHapticsSettings() {
        const tab = document.getElementById('controller-tab');
        tab.innerHTML = '';

        const hapticsSettings = configData['cw::HapticsProjectSettings'] || {};

        const group = createSettingsGroup('Controller Haptics Settings');
        tab.appendChild(group);

        // Heavy Rumble
        createRangeInput(group, 'Heavy Rumble Duration (ms)', 'heavyRumbleDurationMS', hapticsSettings, 100, 1000, 10);
        createRangeInput(group, 'Heavy Rumble High Frequency', 'heavyRumbleHighFrequency', hapticsSettings, 0, 1, 0.05);
        createRangeInput(group, 'Heavy Rumble Low Frequency', 'heavyRumbleLowFrequency', hapticsSettings, 0, 1, 0.05);

        // Medium Rumble
        createRangeInput(group, 'Medium Rumble Duration (ms)', 'mediumRumbleDurationMS', hapticsSettings, 100, 1000, 10);
        createRangeInput(group, 'Medium Rumble High Frequency', 'mediumRumbleHighFrequency', hapticsSettings, 0, 1, 0.05);
        createRangeInput(group, 'Medium Rumble Low Frequency', 'mediumRumbleLowFrequency', hapticsSettings, 0, 1, 0.05);

        // Light Rumble
        createRangeInput(group, 'Light Rumble Duration (ms)', 'lightRumbleDurationMS', hapticsSettings, 100, 1000, 10);
        createRangeInput(group, 'Light Rumble High Frequency', 'lightRumbleHighFrequency', hapticsSettings, 0, 1, 0.05);
        createRangeInput(group, 'Light Rumble Low Frequency', 'lightRumbleLowFrequency', hapticsSettings, 0, 1, 0.05);
    }

    function renderMarkerSettings() {
        const tab = document.getElementById('markers-tab');
        tab.innerHTML = '';

        const markerSettings = configData['cw::hud::battle::VehicleMarkerSettingsSingleton::ProjectSettings'] || {};
        const vehicleMarkerSettings = markerSettings['Vehicle Marker Settings'] || {};
        const allySettings = vehicleMarkerSettings['markerSettings']?.allyMarkerSettings?.markerSettings || defaultValues.markers.ally;
        const enemySettings = vehicleMarkerSettings['markerSettings']?.enemyMarkerSettings?.markerSettings || defaultValues.markers.enemy;
        const platoonSettings = vehicleMarkerSettings['markerSettings']?.platoonMarkerSettings?.markerSettings || defaultValues.markers.platoon;

        const group = createSettingsGroup('Marker Visibility Settings');
        tab.appendChild(group);

        // Create a tab system for marker types
        const markerTypeTabs = document.createElement('div');
        markerTypeTabs.className = 'settings-tabs';
        markerTypeTabs.style.marginBottom = '1rem';

        const allyTab = document.createElement('button');
        allyTab.className = 'tab-btn active';
        allyTab.textContent = 'Allies';
        allyTab.setAttribute('data-marker-type', 'ally');

        const enemyTab = document.createElement('button');
        enemyTab.className = 'tab-btn';
        enemyTab.textContent = 'Enemies';
        enemyTab.setAttribute('data-marker-type', 'enemy');

        const platoonTab = document.createElement('button');
        platoonTab.className = 'tab-btn';
        platoonTab.textContent = 'Platoon';
        platoonTab.setAttribute('data-marker-type', 'platoon');

        markerTypeTabs.append(allyTab, enemyTab, platoonTab);
        group.appendChild(markerTypeTabs);

        // Create container for marker type content
        const markerTypeContent = document.createElement('div');
        markerTypeContent.className = 'marker-type-content';
        group.appendChild(markerTypeContent);

        // Function to render marker settings for a type
        function renderMarkerType(type, settings) {
            markerTypeContent.innerHTML = '';

            const states = Object.keys(settings);
            states.forEach(state => {
                const stateSettings = settings[state];
                const stateGroup = document.createElement('div');
                stateGroup.className = 'marker-state-group';

                const stateHeader = document.createElement('h4');
                stateHeader.textContent = state.replace(/([A-Z])/g, ' $1').trim();
                stateHeader.style.margin = '1rem 0 0.5rem';
                stateHeader.style.color = 'var(--text-primary)';
                stateGroup.appendChild(stateHeader);

                // Create opacity slider
                if (stateSettings.opacity !== undefined) {
                    createRangeInput(stateGroup, 'Opacity', 'opacity', stateSettings, 0, 1, 0.05);
                }

                // Create checkboxes for all boolean properties
                Object.keys(stateSettings).forEach(key => {
                    if (typeof stateSettings[key] === 'boolean') {
                        const label = key.replace('is', '').replace(/([A-Z])/g, ' $1').trim();
                        createCheckbox(stateGroup, label, key, stateSettings);
                    }
                });

                markerTypeContent.appendChild(stateGroup);
            });
        }

        // Initial render
        renderMarkerType('ally', allySettings);

        // Tab switching
        [allyTab, enemyTab, platoonTab].forEach(tab => {
            tab.addEventListener('click', () => {
                [allyTab, enemyTab, platoonTab].forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const type = tab.getAttribute('data-marker-type');
                if (type === 'ally') {
                    renderMarkerType('ally', allySettings);
                } else if (type === 'enemy') {
                    renderMarkerType('enemy', enemySettings);
                } else if (type === 'platoon') {
                    renderMarkerType('platoon', platoonSettings);
                }
            });
        });
    }

    function renderWindowSettings() {
        const tab = document.getElementById('window-tab');
        tab.innerHTML = '';

        const windowSettings = configData['engine::WindowProjectSettings'] || {};

        const group = createSettingsGroup('Window Resolution Settings');
        tab.appendChild(group);

        if (windowSettings.minSize) {
            createRangeInput(group, 'Minimum Window Width', 'width', windowSettings.minSize, 800, 3840, 10);
            createRangeInput(group, 'Minimum Window Height', 'height', windowSettings.minSize, 600, 2160, 10);
        }
    }

    function renderFrameLimiterSettings() {
        const tab = document.getElementById('resolution-tab');

        const frameLimiterSettings = configData['FrameLimiterSettings'] || {};

        // Only proceed if we have frame limiter settings
        if (Object.keys(frameLimiterSettings).length > 0) {
            const group = createSettingsGroup('Frame Limiter Settings');
            tab.appendChild(group);

            // Client settings
            if (frameLimiterSettings.client) {
                const clientGroup = document.createElement('div');
                clientGroup.className = 'frame-limiter-group';
                clientGroup.style.marginBottom = '1.5rem';

                const clientHeader = document.createElement('h4');
                clientHeader.textContent = 'Active Client';
                clientHeader.style.marginBottom = '0.5rem';
                clientGroup.appendChild(clientHeader);

                createRangeInput(clientGroup, 'Frequency (FPS)', 'frequency', frameLimiterSettings.client, 30, 360, 1);
                createRangeInput(clientGroup, 'Carried Overspent', 'carriedOverspent', frameLimiterSettings.client, 0.1, 1.0, 0.05);

                group.appendChild(clientGroup);
            }

            // Inactive client settings
            if (frameLimiterSettings['inactive client']) {
                const inactiveClientGroup = document.createElement('div');
                inactiveClientGroup.className = 'frame-limiter-group';
                inactiveClientGroup.style.marginBottom = '1.5rem';

                const inactiveClientHeader = document.createElement('h4');
                inactiveClientHeader.textContent = 'Inactive Client';
                inactiveClientHeader.style.marginBottom = '0.5rem';
                inactiveClientGroup.appendChild(inactiveClientHeader);

                createRangeInput(inactiveClientGroup, 'Frequency (FPS)', 'frequency', frameLimiterSettings['inactive client'], 10, 144, 1);
                createRangeInput(inactiveClientGroup, 'Carried Overspent', 'carriedOverspent', frameLimiterSettings['inactive client'], 0.1, 1.0, 0.05);

                group.appendChild(inactiveClientGroup);
            }
        }
    }

    function renderResolutionSettings() {
        const tab = document.getElementById('resolution-tab');
        tab.innerHTML = '';

        // Find resolution presets in config
        let resolutionPresets = [];
        let breakpoints = [];

        // Search for resolution settings in config (they might be in different places)
        if (configData['engine::WindowSettings']) {
            resolutionPresets = configData['engine::WindowSettings'].values || [];
        } else {
            // Search through all keys for resolution settings
            for (const key in configData) {
                if (key.includes('WindowSettings') && configData[key].values) {
                    resolutionPresets = configData[key].values || [];
                    break;
                }
            }
        }

        // Search for breakpoints
        if (configData['engine::Breakpoints']) {
            breakpoints = configData['engine::Breakpoints'];
        } else {
            for (const key in configData) {
                if (key.includes('Breakpoints')) {
                    breakpoints = configData[key];
                    break;
                }
            }
        }

        // Resolution Presets
        if (resolutionPresets.length > 0) {
            const presetsGroup = createSettingsGroup('Resolution Presets');
            tab.appendChild(presetsGroup);

            resolutionPresets.forEach((preset, index) => {
                if (preset.value && preset.value['resolution fullscreen']) {
                    const presetGroup = document.createElement('div');
                    presetGroup.className = 'resolution-preset-group';
                    presetGroup.style.marginBottom = '1.5rem';

                    const presetHeader = document.createElement('h4');
                    presetHeader.textContent = preset.key;
                    presetHeader.style.marginBottom = '0.5rem';
                    presetGroup.appendChild(presetHeader);

                    createRangeInput(presetGroup, 'Width', 'width', preset.value['resolution fullscreen'], 800, 7680, 10);
                    createRangeInput(presetGroup, 'Height', 'height', preset.value['resolution fullscreen'], 600, 4320, 10);

                    presetsGroup.appendChild(presetGroup);
                }
            });
        }

        // Breakpoints
        if (breakpoints.length > 0) {
            const breakpointsGroup = createSettingsGroup('Resolution Breakpoints');
            tab.appendChild(breakpointsGroup);

            breakpoints.forEach((bp, index) => {
                if (bp.Width !== undefined && bp.Height !== undefined && bp.Scale !== undefined) {
                    const bpGroup = document.createElement('div');
                    bpGroup.className = 'breakpoint-group';
                    bpGroup.style.marginBottom = '1rem';

                    const bpHeader = document.createElement('h4');
                    bpHeader.textContent = `Breakpoint ${index + 1}`;
                    bpHeader.style.marginBottom = '0.5rem';
                    bpGroup.appendChild(bpHeader);

                    createRangeInput(bpGroup, 'Width', 'Width', bp, 0, 7680, 10);
                    createRangeInput(bpGroup, 'Height', 'Height', bp, 0, 4320, 10);
                    createRangeInput(bpGroup, 'Scale', 'Scale', bp, 0.1, 3, 0.01);

                    breakpointsGroup.appendChild(bpGroup);
                }
            });
        }
    }

    // Helper function to create a settings group
    function createSettingsGroup(title) {
        const group = document.createElement('div');
        group.className = 'settings-group';

        const heading = document.createElement('h3');
        heading.textContent = title;
        group.appendChild(heading);

        return group;
    }

    // Helper function to create a range input
    function createRangeInput(container, label, key, settingsObj, min, max, step) {
        const value = settingsObj[key] !== undefined ? settingsObj[key] : 0;

        const item = document.createElement('div');
        item.className = 'setting-item';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.htmlFor = `setting-${key}`;
        item.appendChild(labelEl);

        const input = document.createElement('input');
        input.type = 'range';
        input.id = `setting-${key}`;
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;
        input.addEventListener('input', (e) => {
            settingsObj[key] = parseFloat(e.target.value);
            valueDisplay.textContent = settingsObj[key].toFixed(2);
        });
        item.appendChild(input);

        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'setting-value';
        valueDisplay.textContent = value.toFixed(2);
        item.appendChild(valueDisplay);

        // Add reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-reset';
        resetBtn.innerHTML = '<i class="fas fa-undo"></i>';
        resetBtn.title = 'Reset to default';
        resetBtn.addEventListener('click', () => {
            let defaultValue = 0;

            // Find default value based on the settings object
            if (settingsObj === configData['cw::AimingProjectSettings']) {
                defaultValue = defaultValues.aiming[key] !== undefined ? defaultValues.aiming[key] : value;
            } else if (settingsObj === configData['cw::FollowAimSettings']) {
                defaultValue = defaultValues.followAim[key] !== undefined ? defaultValues.followAim[key] : value;
            } else if (settingsObj === configData['cw::ArmorOutlinerProjectSettings']) {
                defaultValue = defaultValues.armorOutliner[key] !== undefined ? defaultValues.armorOutliner[key] : value;
            } else if (settingsObj === configData['cw::HapticsProjectSettings']) {
                defaultValue = defaultValues.haptics[key] !== undefined ? defaultValues.haptics[key] : value;
            } else if (settingsObj === configData['engine::WindowProjectSettings']?.minSize) {
                defaultValue = defaultValues.window.minSize[key] !== undefined ? defaultValues.window.minSize[key] : value;
            } else if (settingsObj === configData['FrameLimiterSettings']?.client || settingsObj === configData['FrameLimiterSettings']?.['inactive client']) {
                defaultValue = defaultValues.frameLimiter[key] !== undefined ? defaultValues.frameLimiter[key] : value;
            }

            settingsObj[key] = defaultValue;
            input.value = defaultValue;
            valueDisplay.textContent = defaultValue.toFixed(2);
        });
        item.appendChild(resetBtn);

        container.appendChild(item);
    }

    // Helper function to create a checkbox input
    function createCheckbox(container, label, key, settingsObj) {
        const value = settingsObj[key] !== undefined ? settingsObj[key] : false;

        const item = document.createElement('div');
        item.className = 'setting-item checkbox-item';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `setting-${key}`;
        input.checked = value;
        input.addEventListener('change', (e) => {
            settingsObj[key] = e.target.checked;
        });
        item.appendChild(input);

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.htmlFor = `setting-${key}`;
        item.appendChild(labelEl);

        // Add reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-reset';
        resetBtn.innerHTML = '<i class="fas fa-undo"></i>';
        resetBtn.title = 'Reset to default';
        resetBtn.addEventListener('click', () => {
            let defaultValue = false;

            // Find default value based on the settings object
            if (settingsObj === configData['cw::AimingProjectSettings']) {
                defaultValue = defaultValues.aiming[key] !== undefined ? defaultValues.aiming[key] : value;
            } else if (settingsObj === configData['cw::FollowAimSettings']) {
                defaultValue = defaultValues.followAim[key] !== undefined ? defaultValues.followAim[key] : value;
            } else if (settingsObj === configData['cw::ArmorOutlinerProjectSettings']) {
                defaultValue = defaultValues.armorOutliner[key] !== undefined ? defaultValues.armorOutliner[key] : value;
            } else if (settingsObj === configData['cw::HapticsProjectSettings']) {
                defaultValue = defaultValues.haptics[key] !== undefined ? defaultValues.haptics[key] : value;
            } else if (settingsObj === configData['cw::hud::battle::VehicleMarkerSettingsSingleton::ProjectSettings']) {
                defaultValue = defaultValues.markers[key] !== undefined ? defaultValues.markers[key] : value;
            }

            settingsObj[key] = defaultValue;
            input.checked = defaultValue;
        });
        item.appendChild(resetBtn);

        container.appendChild(item);
    }

    // Helper function to create a dropdown input
    function createDropdown(container, label, key, settingsObj, options) {
        const value = settingsObj[key] !== undefined ? settingsObj[key] : options[0];

        const item = document.createElement('div');
        item.className = 'setting-item';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.htmlFor = `setting-${key}`;
        item.appendChild(labelEl);

        const select = document.createElement('select');
        select.id = `setting-${key}`;

        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            optionEl.selected = option === value;
            select.appendChild(optionEl);
        });

        select.addEventListener('change', (e) => {
            settingsObj[key] = e.target.value;
        });
        item.appendChild(select);

        // Add reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-reset';
        resetBtn.innerHTML = '<i class="fas fa-undo"></i>';
        resetBtn.title = 'Reset to default';
        resetBtn.addEventListener('click', () => {
            let defaultValue = options[0];

            // Find default value based on the settings object
            if (settingsObj === configData['cw::AimingProjectSettings']) {
                defaultValue = defaultValues.aiming[key] !== undefined ? defaultValues.aiming[key] : value;
            }

            settingsObj[key] = defaultValue;
            select.value = defaultValue;
        });
        item.appendChild(resetBtn);

        container.appendChild(item);
    }

    // Reset all settings to default
    function resetAllSettings() {
        if (!configData || !originalConfig) return;

        // Reset aiming settings
        if (configData['cw::AimingProjectSettings']) {
            Object.keys(defaultValues.aiming).forEach(key => {
                configData['cw::AimingProjectSettings'][key] = defaultValues.aiming[key];
            });
        }

        // Reset follow aim settings
        if (configData['cw::FollowAimSettings']) {
            Object.keys(defaultValues.followAim).forEach(key => {
                configData['cw::FollowAimSettings'][key] = defaultValues.followAim[key];
            });
        }

        // Reset armor outliner settings
        if (configData['cw::ArmorOutlinerProjectSettings']) {
            Object.keys(defaultValues.armorOutliner).forEach(key => {
                configData['cw::ArmorOutlinerProjectSettings'][key] = defaultValues.armorOutliner[key];
            });
        }

        // Reset haptics settings
        if (configData['cw::HapticsProjectSettings']) {
            Object.keys(defaultValues.haptics).forEach(key => {
                configData['cw::HapticsProjectSettings'][key] = defaultValues.haptics[key];
            });
        }

        // Reset window settings
        if (configData['engine::WindowProjectSettings']) {
            Object.keys(defaultValues.window.minSize).forEach(key => {
                configData['engine::WindowProjectSettings'].minSize[key] = defaultValues.window.minSize[key];
            });
        }

        // Reset frame limiter settings
        if (configData['FrameLimiterSettings']) {
            if (configData['FrameLimiterSettings'].client) {
                Object.keys(defaultValues.frameLimiter.client).forEach(key => {
                    configData['FrameLimiterSettings'].client[key] = defaultValues.frameLimiter.client[key];
                });
            }
            if (configData['FrameLimiterSettings']['inactive client']) {
                Object.keys(defaultValues.frameLimiter['inactive client']).forEach(key => {
                    configData['FrameLimiterSettings']['inactive client'][key] = defaultValues.frameLimiter['inactive client'][key];
                });
            }
        }

        // Reset marker settings
        if (configData['cw::hud::battle::VehicleMarkerSettingsSingleton::ProjectSettings']) {
            const markerSettings = configData['cw::hud::battle::VehicleMarkerSettingsSingleton::ProjectSettings'];
            if (markerSettings['Vehicle Marker Settings']?.markerSettings?.allyMarkerSettings?.markerSettings) {
                Object.assign(markerSettings['Vehicle Marker Settings'].markerSettings.allyMarkerSettings.markerSettings, defaultValues.markers.ally);
            }
            if (markerSettings['Vehicle Marker Settings']?.markerSettings?.enemyMarkerSettings?.markerSettings) {
                Object.assign(markerSettings['Vehicle Marker Settings'].markerSettings.enemyMarkerSettings.markerSettings, defaultValues.markers.enemy);
            }
            if (markerSettings['Vehicle Marker Settings']?.markerSettings?.platoonMarkerSettings?.markerSettings) {
                Object.assign(markerSettings['Vehicle Marker Settings'].markerSettings.platoonMarkerSettings.markerSettings, defaultValues.markers.platoon);
            }
        }

        // Re-render all settings
        renderSettings();
        showToast('All settings reset to default values');
    }

    // Show toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Dynamic toast styles (yes, I know, there is a CSS file, shut up)
    const toastStyles = document.createElement('style');
    toastStyles.textContent = `
    .toast-notification {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100%);
      background-color: var(--accent-color);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      opacity: 0;
      transition: all 0.3s ease;
    }

    .toast-notification.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  `;
    document.head.appendChild(toastStyles);
});