document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const mapSelectionGrid = document.querySelector('.map-grid');
    const strategyPlanner = document.getElementById('strategyPlanner');
    const planCodeInput = document.getElementById('planCodeInput');
    const loadPlanBtn = document.getElementById('loadPlanBtn');
    const backToPlansBtn = document.getElementById('backToPlansBtn');
    const savePlanBtn = document.getElementById('savePlanBtn');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    const planTitle = document.getElementById('planTitle');
    const planDescription = document.getElementById('planDescription');
    const titleCharCount = document.getElementById('titleCharCount');
    const descCharCount = document.getElementById('descCharCount');
    const mapImage = document.getElementById('mapImage');
    const strategyCanvas = document.getElementById('strategyCanvas');
    const ctx = strategyCanvas.getContext('2d');
    const toolButtons = document.querySelectorAll('.tool-btn');
    const colorPicker = document.getElementById('colorPicker');
    const widthSlider = document.getElementById('widthSlider');
    const opacitySlider = document.getElementById('opacitySlider');
    const widthValue = document.getElementById('widthValue');
    const opacityValue = document.getElementById('opacityValue');
    const addLayerBtn = document.getElementById('addLayerBtn');
    const deleteLayerBtn = document.getElementById('deleteLayerBtn');
    const renameLayerBtn = document.getElementById('renameLayerBtn');
    const layersList = document.getElementById('layersList');
    const customNotification = document.getElementById('customNotification');
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationIcon = document.getElementById('notificationIcon');
    const textInputModal = document.getElementById('textInputModal');
    const textInputField = document.getElementById('textInputField');
    const confirmTextBtn = document.getElementById('confirmTextBtn');
    const cancelTextBtn = document.getElementById('cancelTextBtn');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationTitle = document.getElementById('confirmationTitle');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    const cancelActionBtn = document.getElementById('cancelActionBtn');
    const loadPlanSection = document.querySelector('.load-plan-section');
    const createPlanSection = document.querySelector('.create-plan-section');
    const shareCodeModal = document.getElementById('shareCodeModal');
    const shareCodeDisplay = document.getElementById('shareCodeDisplay');
    const copyShareCodeBtn = document.getElementById('copyShareCodeBtn');
    const closeShareCodeModal = document.getElementById('closeShareCodeModal');
    const renameLayerModal = document.getElementById('renameLayerModal');
    const renameLayerInput = document.getElementById('renameLayerInput');
    const renameLayerTitle = document.getElementById('renameLayerTitle');
    const renameLayerCharCount = document.getElementById('renameLayerCharCount');
    const confirmRenameBtn = document.getElementById('confirmRenameBtn');
    const cancelRenameBtn = document.getElementById('cancelRenameBtn');

    // State variables
    let currentTool = 'select';
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentColor = '#ff8300';
    let currentWidth = 3;
    let currentOpacity = 1;
    let layers = [];
    let currentLayerIndex = 0;
    let currentMap = '';
    let canvasStates = [];
    let currentStateIndex = -1;
    let pendingTextPosition = {
        x: 0,
        y: 0
    };
    let selectedItem = null;
    let tempShape = null;
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let isResizing = false;
    let isRotating = false;
    let resizeHandle = null;
    let rotationHandle = null;
    let originalAngle = 0;
    let originalWidth = 0;
    let originalHeight = 0;
    let originalPoints = [];

    // Constants for selection box
    const HANDLE_SIZE = 8;
    const ROTATION_HANDLE_DISTANCE = 30;
    const RESIZE_HANDLES = [{
            id: 'nw',
            x: 0,
            y: 0,
            cursor: 'nw-resize'
        },
        {
            id: 'ne',
            x: 1,
            y: 0,
            cursor: 'ne-resize'
        },
        {
            id: 'sw',
            x: 0,
            y: 1,
            cursor: 'sw-resize'
        },
        {
            id: 'se',
            x: 1,
            y: 1,
            cursor: 'se-resize'
        },
        {
            id: 'n',
            x: 0.5,
            y: 0,
            cursor: 'n-resize'
        },
        {
            id: 's',
            x: 0.5,
            y: 1,
            cursor: 's-resize'
        },
        {
            id: 'w',
            x: 0,
            y: 0.5,
            cursor: 'w-resize'
        },
        {
            id: 'e',
            x: 1,
            y: 0.5,
            cursor: 'e-resize'
        }
    ];

    // Map data
    const maps = [{
            id: 'blossom_crash',
            name: 'Blossom Crash',
            image: 'https://github.com/HEATLabs/HEAT-Labs-Images-Features/blob/main/strat-planner/blossom_crash_radar.webp?raw=true'
        },
        {
            id: 'nord_oko',
            name: 'Nord Oko',
            image: 'https://github.com/HEATLabs/HEAT-Labs-Images-Features/blob/main/strat-planner/nord_oko_radar.webp?raw=true'
        },
        {
            id: 'scarred_city',
            name: 'Scarred City',
            image: 'https://github.com/HEATLabs/HEAT-Labs-Images-Features/blob/main/strat-planner/scarred_city_radar.webp?raw=true'
        },
        {
            id: 'sunstroke',
            name: 'Sunstroke',
            image: 'https://github.com/HEATLabs/HEAT-Labs-Images-Features/blob/main/strat-planner/sunstroke_radar.webp?raw=true'
        }
    ];

    // Initialize the app
    function init() {
        setupEventListeners();
        renderMapGrid();
        setupCanvas();
        addInitialLayer();
        updateCharCounts();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Load plan
        loadPlanBtn.addEventListener('click', loadPlanFromCode);
        planCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadPlanFromCode();
            }
        });

        // Planner actions
        backToPlansBtn.addEventListener('click', showPlansSection);
        savePlanBtn.addEventListener('click', savePlan);
        clearCanvasBtn.addEventListener('click', confirmClearCanvas);

        // Share code modal
        copyShareCodeBtn.addEventListener('click', copyCodeToClipboard);
        closeShareCodeModal.addEventListener('click', hideShareCodeModal);

        // Tool buttons
        toolButtons.forEach(button => {
            button.addEventListener('click', function() {
                setCurrentTool(this.dataset.tool);
            });
        });

        // Property controls
        colorPicker.addEventListener('input', function() {
            currentColor = this.value;
            if (selectedItem) {
                selectedItem.color = currentColor;
                redrawCanvas();
            }
        });

        widthSlider.addEventListener('input', function() {
            currentWidth = this.value;
            widthValue.textContent = currentWidth;
            if (selectedItem) {
                selectedItem.width = currentWidth;
                redrawCanvas();
            }
        });

        opacitySlider.addEventListener('input', function() {
            currentOpacity = this.value / 100;
            opacityValue.textContent = `${this.value}%`;
            if (selectedItem) {
                selectedItem.opacity = currentOpacity;
                redrawCanvas();
            }
        });

        // Layer controls
        addLayerBtn.addEventListener('click', addNewLayer);
        deleteLayerBtn.addEventListener('click', confirmDeleteLayer);
        renameLayerBtn.addEventListener('click', showRenameLayerModal);
        renameLayerInput.addEventListener('input', updateRenameCharCount);
        confirmRenameBtn.addEventListener('click', confirmLayerRename);
        cancelRenameBtn.addEventListener('click', hideRenameLayerModal);
        renameLayerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                confirmLayerRename();
            }
        });

        // Text input modal
        confirmTextBtn.addEventListener('click', confirmTextInput);
        cancelTextBtn.addEventListener('click', hideTextInputModal);
        textInputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                confirmTextInput();
            }
        });

        // Confirmation modal
        confirmActionBtn.addEventListener('click', executeConfirmedAction);
        cancelActionBtn.addEventListener('click', hideConfirmationModal);

        // Character count updates
        planTitle.addEventListener('input', updateCharCounts);
        planDescription.addEventListener('input', updateCharCounts);
    }

    // Show rename layer modal
    function showRenameLayerModal() {
        if (layers.length === 0) return;

        const currentLayer = layers[currentLayerIndex];
        renameLayerInput.value = currentLayer.name;
        renameLayerTitle.textContent = `Rename "${currentLayer.name}"`;
        renameLayerCharCount.textContent = `${currentLayer.name.length}/25`;
        renameLayerModal.classList.remove('hidden');
        renameLayerInput.focus();
    }

    // Hide rename layer modal
    function hideRenameLayerModal() {
        renameLayerModal.classList.add('hidden');
    }

    // Confirm layer rename
    function confirmLayerRename() {
        const newName = renameLayerInput.value.trim();
        if (newName && layers[currentLayerIndex]) {
            if (newName.length > 25) {
                showNotification('Layer name must be 25 characters or less', 'error');
                return;
            }

            layers[currentLayerIndex].name = newName;
            renderLayersList();
            hideRenameLayerModal();
            showNotification('Layer renamed successfully', 'success');
        }
    }

    // Update rename layer character count
    function updateRenameCharCount() {
        const length = renameLayerInput.value.length;
        renameLayerCharCount.textContent = `${length}/25`;

        if (length >= 25) {
            renameLayerCharCount.classList.add('text-red-400');
        } else {
            renameLayerCharCount.classList.remove('text-red-400');
        }
    }

    // Update character counts
    function updateCharCounts() {
        const titleLength = planTitle.value.length;
        const descLength = planDescription.value.length;

        titleCharCount.textContent = `${titleLength}/100`;
        descCharCount.textContent = `${descLength}/250`;

        if (titleLength >= 100) {
            titleCharCount.classList.add('text-red-400');
        } else {
            titleCharCount.classList.remove('text-red-400');
        }

        if (descLength >= 250) {
            descCharCount.classList.add('text-red-400');
        } else {
            descCharCount.classList.remove('text-red-400');
        }
    }

    // Show share code modal
    function showShareCodeModal(code) {
        shareCodeDisplay.value = code;
        shareCodeModal.classList.remove('hidden');
    }

    // Hide share code modal
    function hideShareCodeModal() {
        shareCodeModal.classList.add('hidden');
    }

    // Copy code to clipboard
    function copyCodeToClipboard() {
        shareCodeDisplay.select();
        document.execCommand('copy');

        // Show feedback
        const originalText = copyShareCodeBtn.innerHTML;
        copyShareCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyShareCodeBtn.innerHTML = originalText;
        }, 2000);

        showNotification('Share code copied to clipboard', 'success');
    }

    // Render the map selection grid
    function renderMapGrid() {
        mapSelectionGrid.innerHTML = '';

        maps.forEach(map => {
            const mapItem = document.createElement('div');
            mapItem.className = 'map-item';
            mapItem.dataset.mapId = map.id;
            mapItem.innerHTML = `
                <img src="${map.image}" alt="${map.name}" class="map-image">
                <div class="map-info">
                    <h3 class="map-name">${map.name}</h3>
                </div>
            `;
            mapItem.addEventListener('click', () => selectMap(map.id));
            mapSelectionGrid.appendChild(mapItem);
        });
    }

    // Show plans section (load/create)
    function showPlansSection() {
        strategyPlanner.classList.add('hidden');
        loadPlanSection.classList.remove('hidden');
        createPlanSection.classList.remove('hidden');
        document.querySelector('.load-plan-section').scrollIntoView({
            behavior: 'smooth'
        });
    }

    // Select a map and show the planner
    function selectMap(mapId) {
        const selectedMap = maps.find(map => map.id === mapId);
        if (!selectedMap) return;
        currentMap = mapId;
        mapImage.src = selectedMap.image;
        strategyPlanner.classList.remove('hidden');
        loadPlanSection.classList.add('hidden');
        createPlanSection.classList.add('hidden');
        // Reset canvas size based on the image
        setTimeout(() => {
            resizeCanvas();
            redrawCanvas();
            // Check if the element exists before scrolling
            const sectionElement = document.getElementById('planTitle');
            if (sectionElement) {
                sectionElement.scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                // Fallback to scrolling to top if element doesn't exist
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }

    // Load plan from share code
    function loadPlanFromCode() {
        const code = planCodeInput.value.trim();
        if (!code) {
            showNotification('Please enter a share code', 'error');
            return;
        }

        try {
            const planData = decodePlan(code);
            if (!planData) throw new Error('Invalid plan code');

            currentMap = planData.map;
            planTitle.value = planData.title || '';
            planDescription.value = planData.description || '';
            updateCharCounts();

            const selectedMap = maps.find(map => map.id === currentMap);
            if (selectedMap) {
                mapImage.src = selectedMap.image;
            }

            // Load layers and drawings
            layers = planData.layers || [];
            if (layers.length === 0) {
                addInitialLayer();
            } else {
                currentLayerIndex = 0;
                renderLayersList();
            }

            // Show the planner
            strategyPlanner.classList.remove('hidden');
            loadPlanSection.classList.add('hidden');
            createPlanSection.classList.add('hidden');
            planCodeInput.value = '';

            // Redraw canvas
            setTimeout(() => {
                resizeCanvas();
                redrawCanvas();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                showNotification('Plan loaded successfully', 'success');
            }, 100);

        } catch (error) {
            console.error('Error loading plan:', error);
            showNotification('Failed to load plan. Please check the share code.', 'error');
        }
    }

    // Set up canvas
    function setupCanvas() {
        resizeCanvas();

        // Drawing event listeners
        strategyCanvas.addEventListener('mousedown', startDrawing);
        strategyCanvas.addEventListener('mousemove', draw);
        strategyCanvas.addEventListener('mouseup', stopDrawing);
        strategyCanvas.addEventListener('mouseout', stopDrawing);

        strategyCanvas.addEventListener('touchstart', handleTouchStart, {
            passive: false
        });
        strategyCanvas.addEventListener('touchmove', handleTouchMove, {
            passive: false
        });
        strategyCanvas.addEventListener('touchend', handleTouchEnd);
    }

    // Resize canvas to match image
    function resizeCanvas() {
        const container = strategyCanvas.parentElement;
        const size = container.offsetWidth;
        strategyCanvas.width = size;
        strategyCanvas.height = size;
        redrawCanvas();
    }

    // Start drawing
    function startDrawing(e) {
        if (currentTool === 'select') {
            const pos = getCanvasPosition(e);

            // Check if we're clicking on a resize handle
            if (selectedItem) {
                const handle = getResizeHandleAtPosition(pos.x, pos.y);
                if (handle) {
                    isResizing = true;
                    resizeHandle = handle;
                    originalWidth = selectedItem.width || (selectedItem.x2 - selectedItem.x1);
                    originalHeight = selectedItem.height || (selectedItem.y2 - selectedItem.y1);
                    originalPoints = selectedItem.points ? [...selectedItem.points] : null;
                    saveCanvasState();
                    return;
                }

                // Check if we're clicking on the rotation handle
                if (isPointNearRotationHandle(pos.x, pos.y)) {
                    isRotating = true;
                    const center = getItemCenter(selectedItem);
                    originalAngle = Math.atan2(pos.y - center.y, pos.x - center.x);
                    if (selectedItem.angle) {
                        originalAngle -= selectedItem.angle;
                    }
                    saveCanvasState();
                    return;
                }
            }

            // Check if we're clicking on an item
            selectedItem = findItemAtPosition(pos.x, pos.y);

            if (selectedItem) {
                isDragging = true;
                const center = getItemCenter(selectedItem);
                dragOffsetX = pos.x - center.x;
                dragOffsetY = pos.y - center.y;
                saveCanvasState();
            }
            redrawCanvas();
            return;
        }

        if (currentTool === 'select') return;

        isDrawing = true;
        const pos = getCanvasPosition(e);
        lastX = pos.x;
        lastY = pos.y;

        // Save current state for undo
        saveCanvasState();

        // For freehand drawing, start a new path
        if (currentTool === 'freehand') {
            const currentLayer = layers[currentLayerIndex];
            currentLayer.drawing = currentLayer.drawing || [];
            currentLayer.drawing.push({
                type: 'path',
                points: [{
                    x: lastX,
                    y: lastY
                }],
                color: currentColor,
                width: currentWidth,
                opacity: currentOpacity
            });
        }

        // For text tool, show text input modal
        if (currentTool === 'text') {
            pendingTextPosition = {
                x: lastX,
                y: lastY
            };
            showTextInputModal();
            isDrawing = false;
        }

        // For shape tools, create a temporary shape
        if (['line', 'arrow', 'rectangle', 'circle'].includes(currentTool)) {
            tempShape = {
                type: currentTool,
                x1: lastX,
                y1: lastY,
                x2: lastX,
                y2: lastY,
                color: currentColor,
                width: currentWidth,
                opacity: currentOpacity
            };
        }
    }

    // Draw on canvas
    function draw(e) {
        if (!isDrawing && !isDragging && !isResizing && !isRotating) return;

        const pos = getCanvasPosition(e);
        const x = pos.x;
        const y = pos.y;

        const currentLayer = layers[currentLayerIndex];

        if (isDragging && selectedItem) {
            // Move the selected item
            const newCenterX = x - dragOffsetX;
            const newCenterY = y - dragOffsetY;

            if (selectedItem.type === 'line' || selectedItem.type === 'arrow') {
                const width = selectedItem.x2 - selectedItem.x1;
                const height = selectedItem.y2 - selectedItem.y1;
                selectedItem.x1 = newCenterX - width / 2;
                selectedItem.y1 = newCenterY - height / 2;
                selectedItem.x2 = newCenterX + width / 2;
                selectedItem.y2 = newCenterY + height / 2;
            } else if (selectedItem.type === 'rect') {
                selectedItem.x = newCenterX - selectedItem.width / 2;
                selectedItem.y = newCenterY - selectedItem.height / 2;
            } else if (selectedItem.type === 'circle') {
                selectedItem.x = newCenterX;
                selectedItem.y = newCenterY;
            } else if (selectedItem.type === 'text') {
                selectedItem.x = newCenterX;
                selectedItem.y = newCenterY;
            } else if (selectedItem.type === 'path') {
                const center = getItemCenter(selectedItem);
                const offsetX = newCenterX - center.x;
                const offsetY = newCenterY - center.y;

                selectedItem.points.forEach(point => {
                    point.x += offsetX;
                    point.y += offsetY;
                });
            }
            redrawCanvas();
            return;
        }

        if (isResizing && selectedItem && resizeHandle) {
            const center = getItemCenter(selectedItem);
            const angle = selectedItem.angle || 0;

            // Transform mouse coordinates to item's local space
            const localX = (x - center.x) * Math.cos(-angle) - (y - center.y) * Math.sin(-angle);
            const localY = (x - center.x) * Math.sin(-angle) + (y - center.y) * Math.cos(-angle);

            // For lines/arrows, just move the endpoints directly
            if (selectedItem.type === 'line' || selectedItem.type === 'arrow') {
                if (resizeHandle.id === 'start') {
                    selectedItem.x1 = x;
                    selectedItem.y1 = y;
                } else if (resizeHandle.id === 'end') {
                    selectedItem.x2 = x;
                    selectedItem.y2 = y;
                }
            }
            // For freehand paths, calculate scale factors and transform points
            else if (selectedItem.type === 'path') {
                // Calculate scale factors based on mouse movement
                const scaleX = (localX + originalWidth / 2) / (originalWidth / 2);
                const scaleY = (localY + originalHeight / 2) / (originalHeight / 2);

                // Apply scaling to all points relative to the center
                selectedItem.points = originalPoints.map(point => {
                    return {
                        x: center.x + (point.x - center.x) * scaleX,
                        y: center.y + (point.y - center.y) * scaleY
                    };
                });
            }
            // For other items (rectangles, circles, text)
            else {
                let newWidth = originalWidth;
                let newHeight = originalHeight;

                if (resizeHandle.id === 'nw' || resizeHandle.id === 'w' || resizeHandle.id === 'sw') {
                    newWidth = originalWidth - (localX + originalWidth / 2);
                } else if (resizeHandle.id === 'ne' || resizeHandle.id === 'e' || resizeHandle.id === 'se') {
                    newWidth = localX + originalWidth / 2;
                }

                if (resizeHandle.id === 'nw' || resizeHandle.id === 'n' || resizeHandle.id === 'ne') {
                    newHeight = originalHeight - (localY + originalHeight / 2);
                } else if (resizeHandle.id === 'sw' || resizeHandle.id === 's' || resizeHandle.id === 'se') {
                    newHeight = localY + originalHeight / 2;
                }

                // Apply minimum size
                newWidth = Math.max(newWidth, 5);
                newHeight = Math.max(newHeight, 5);

                // Apply scaling to the item
                if (selectedItem.type === 'rect') {
                    selectedItem.width = newWidth;
                    selectedItem.height = newHeight;
                } else if (selectedItem.type === 'circle') {
                    selectedItem.radius = newWidth / 2;
                } else if (selectedItem.type === 'text') {
                    selectedItem.width = Math.max(1, Math.min(10, newWidth / 20));
                }
            }

            redrawCanvas();
            return;
        }

        if (isRotating && selectedItem) {
            const center = getItemCenter(selectedItem);
            const newAngle = Math.atan2(y - center.y, x - center.x) - originalAngle;
            selectedItem.angle = newAngle;
            redrawCanvas();
            return;
        }

        switch (currentTool) {
            case 'line':
            case 'arrow':
                // Update temp shape
                tempShape.x2 = x;
                tempShape.y2 = y;
                redrawCanvas();
                break;

            case 'rectangle':
                // Update temp shape
                tempShape.x = Math.min(lastX, x);
                tempShape.y = Math.min(lastY, y);
                tempShape.width = Math.abs(x - lastX);
                tempShape.height = Math.abs(y - lastY);
                redrawCanvas();
                break;

            case 'circle':
                // Update temp shape
                tempShape.radius = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
                redrawCanvas();
                break;

            case 'freehand':
                // Add point to current path
                const path = currentLayer.drawing[currentLayer.drawing.length - 1];
                path.points.push({
                    x,
                    y
                });
                redrawCanvas();
                break;

            case 'erase':
                eraseAtPosition(x, y);
                break;
        }
    }

    // Stop drawing
    function stopDrawing() {
        if (isDragging || isResizing || isRotating) {
            isDragging = false;
            isResizing = false;
            isRotating = false;
            resizeHandle = null;
            return;
        }

        if (!isDrawing) return;
        isDrawing = false;

        const currentLayer = layers[currentLayerIndex];
        currentLayer.drawing = currentLayer.drawing || [];

        // For shapes, add them to the layer when done
        if (tempShape) {
            if (tempShape.type === 'rectangle') {
                currentLayer.drawing.push({
                    type: 'rect',
                    x: tempShape.x,
                    y: tempShape.y,
                    width: tempShape.width,
                    height: tempShape.height,
                    color: tempShape.color,
                    width: tempShape.width,
                    opacity: tempShape.opacity
                });
            } else if (tempShape.type === 'circle') {
                currentLayer.drawing.push({
                    type: 'circle',
                    x: tempShape.x1,
                    y: tempShape.y1,
                    radius: tempShape.radius,
                    color: tempShape.color,
                    width: tempShape.width,
                    opacity: tempShape.opacity
                });
            } else if (tempShape.type === 'line' || tempShape.type === 'arrow') {
                currentLayer.drawing.push({
                    type: tempShape.type,
                    x1: tempShape.x1,
                    y1: tempShape.y1,
                    x2: tempShape.x2,
                    y2: tempShape.y2,
                    color: tempShape.color,
                    width: tempShape.width,
                    opacity: tempShape.opacity
                });
            }

            tempShape = null;
            redrawCanvas();
        }
    }

    // Get the center of an item
    function getItemCenter(item) {
        if (item.type === 'rect') {
            return {
                x: item.x + item.width / 2,
                y: item.y + item.height / 2
            };
        } else if (item.type === 'circle') {
            return {
                x: item.x,
                y: item.y
            };
        } else if (item.type === 'line' || item.type === 'arrow') {
            return {
                x: (item.x1 + item.x2) / 2,
                y: (item.y1 + item.y2) / 2
            };
        } else if (item.type === 'text') {
            ctx.save();
            ctx.font = `${item.width * 5}px Arial`;
            const metrics = ctx.measureText(item.text);
            ctx.restore();
            return {
                x: item.x + metrics.width / 2,
                y: item.y - metrics.actualBoundingBoxAscent / 2
            };
        } else if (item.type === 'path' && item.points && item.points.length > 0) {
            let minX = Infinity,
                maxX = -Infinity,
                minY = Infinity,
                maxY = -Infinity;
            item.points.forEach(point => {
                minX = Math.min(minX, point.x);
                maxX = Math.max(maxX, point.x);
                minY = Math.min(minY, point.y);
                maxY = Math.max(maxY, point.y);
            });
            return {
                x: (minX + maxX) / 2,
                y: (minY + maxY) / 2
            };
        }
        return {
            x: 0,
            y: 0
        };
    }

    // Get the bounding box of an item
    function getItemBoundingBox(item) {
        if (item.type === 'rect') {
            return {
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height
            };
        } else if (item.type === 'circle') {
            return {
                x: item.x - item.radius,
                y: item.y - item.radius,
                width: item.radius * 2,
                height: item.radius * 2
            };
        } else if (item.type === 'line' || item.type === 'arrow') {
            return {
                x: Math.min(item.x1, item.x2) - 10,
                y: Math.min(item.y1, item.y2) - 10,
                width: Math.abs(item.x2 - item.x1) + 20,
                height: Math.abs(item.y2 - item.y1) + 20
            };
        } else if (item.type === 'text') {
            ctx.save();
            ctx.font = `${item.width * 5}px Arial`;
            const metrics = ctx.measureText(item.text);
            ctx.restore();
            return {
                x: item.x,
                y: item.y - metrics.actualBoundingBoxAscent,
                width: metrics.width,
                height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
            };
        } else if (item.type === 'path' && item.points && item.points.length > 0) {
            let minX = Infinity,
                maxX = -Infinity,
                minY = Infinity,
                maxY = -Infinity;
            item.points.forEach(point => {
                minX = Math.min(minX, point.x);
                maxX = Math.max(maxX, point.x);
                minY = Math.min(minY, point.y);
                maxY = Math.max(maxY, point.y);
            });
            return {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
        }
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
    }

    // Find item at position
    function findItemAtPosition(x, y) {
        const currentLayer = layers[currentLayerIndex];
        if (!currentLayer || !currentLayer.drawing) return null;

        // Check from newest to oldest (top to bottom in z-order)
        for (let i = currentLayer.drawing.length - 1; i >= 0; i--) {
            const item = currentLayer.drawing[i];
            const bbox = getItemBoundingBox(item);
            const angle = item.angle || 0;

            // Transform point to item's local space
            const center = getItemCenter(item);
            const localX = (x - center.x) * Math.cos(-angle) - (y - center.y) * Math.sin(-angle) + center.x;
            const localY = (x - center.x) * Math.sin(-angle) + (y - center.y) * Math.cos(-angle) + center.y;

            switch (item.type) {
                case 'line':
                case 'arrow':
                    if (isPointNearLine(localX, localY, item.x1, item.y1, item.x2, item.y2, currentWidth * 2)) {
                        return item;
                    }
                    break;
                case 'rect':
                    if (isPointInRect(localX, localY, bbox.x, bbox.y, bbox.width, bbox.height, 0)) {
                        return item;
                    }
                    break;
                case 'circle':
                    if (isPointInCircle(localX, localY, item.x, item.y, item.radius, 0)) {
                        return item;
                    }
                    break;
                case 'text':
                    if (isPointInRect(localX, localY, bbox.x, bbox.y, bbox.width, bbox.height, 0)) {
                        return item;
                    }
                    break;
                case 'path':
                    if (isPointNearPath(localX, localY, item.points, currentWidth * 2)) {
                        return item;
                    }
                    break;
            }
        }

        return null;
    }

    // Check if point is near a resize handle
    function getResizeHandleAtPosition(x, y) {
        if (!selectedItem) return null;

        const bbox = getItemBoundingBox(selectedItem);
        const center = getItemCenter(selectedItem);
        const angle = selectedItem.angle || 0;

        // For lines and arrows, use special handles at the endpoints
        if (selectedItem.type === 'line' || selectedItem.type === 'arrow') {
            const x1 = selectedItem.x1;
            const y1 = selectedItem.y1;
            const x2 = selectedItem.x2;
            const y2 = selectedItem.y2;

            // Check if near first endpoint
            if (Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2)) < HANDLE_SIZE * 2) {
                return {
                    id: 'start',
                    x: x1,
                    y: y1,
                    cursor: 'move'
                };
            }
            // Check if near second endpoint
            if (Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2)) < HANDLE_SIZE * 2) {
                return {
                    id: 'end',
                    x: x2,
                    y: y2,
                    cursor: 'move'
                };
            }
            return null;
        }

        // For other items, use standard resize handles
        for (const handle of RESIZE_HANDLES) {
            // Position in item's local space (before rotation)
            const handleX = bbox.x + bbox.width * handle.x - (handle.x === 0.5 ? HANDLE_SIZE / 2 : 0);
            const handleY = bbox.y + bbox.height * handle.y - (handle.y === 0.5 ? HANDLE_SIZE / 2 : 0);

            // Rotate the handle position around the center
            const rotatedX = center.x + (handleX - center.x) * Math.cos(angle) - (handleY - center.y) * Math.sin(angle);
            const rotatedY = center.y + (handleX - center.x) * Math.sin(angle) + (handleY - center.y) * Math.cos(angle);

            // Check if point is near the handle
            if (Math.abs(x - rotatedX) < HANDLE_SIZE && Math.abs(y - rotatedY) < HANDLE_SIZE) {
                return handle;
            }
        }

        return null;
    }

    // Check if point is near the rotation handle
    function isPointNearRotationHandle(x, y) {
        if (!selectedItem) return false;

        // For lines and arrows, don't show rotation handle
        if (selectedItem.type === 'line' || selectedItem.type === 'arrow') {
            return false;
        }

        const bbox = getItemBoundingBox(selectedItem);
        const center = getItemCenter(selectedItem);
        const angle = selectedItem.angle || 0;

        // Position of rotation handle (top center, above the bounding box)
        const handleX = bbox.x + bbox.width / 2;
        const handleY = bbox.y - ROTATION_HANDLE_DISTANCE;

        // Rotate the handle position around the center
        const rotatedX = center.x + (handleX - center.x) * Math.cos(angle) - (handleY - center.y) * Math.sin(angle);
        const rotatedY = center.y + (handleX - center.x) * Math.sin(angle) + (handleY - center.y) * Math.cos(angle);

        // Check if point is near the handle
        return Math.sqrt(Math.pow(x - rotatedX, 2) + Math.pow(y - rotatedY, 2)) < HANDLE_SIZE;
    }

    // Get canvas position from event
    function getCanvasPosition(e) {
        const rect = strategyCanvas.getBoundingClientRect();
        let x, y;

        if (e.touches) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        return {
            x,
            y
        };
    }

    // Handle touch start
    function handleTouchStart(e) {
        e.preventDefault();
        startDrawing(e.touches[0]);
    }

    // Handle touch move
    function handleTouchMove(e) {
        e.preventDefault();
        draw(e.touches[0]);
    }

    // Handle touch end
    function handleTouchEnd(e) {
        e.preventDefault();
        stopDrawing();
    }

    // Draw temporary line (while dragging)
    function drawTempLine(x1, y1, x2, y2, isArrow) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentWidth;
        ctx.globalAlpha = currentOpacity;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (isArrow) {
            drawArrowhead(x2, y2, Math.atan2(y2 - y1, x2 - x1));
        }
    }

    // Draw arrowhead
    function drawArrowhead(x, y, angle) {
        const headLength = 15;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-headLength, -headLength / 2);
        ctx.moveTo(0, 0);
        ctx.lineTo(-headLength, headLength / 2);
        ctx.stroke();

        ctx.restore();
    }

    // Draw temporary rectangle (while dragging)
    function drawTempRect(x1, y1, x2, y2) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentWidth;
        ctx.globalAlpha = currentOpacity;
        ctx.beginPath();
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.stroke();
    }

    // Draw temporary circle (while dragging)
    function drawTempCircle(x1, y1, x2, y2) {
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentWidth;
        ctx.globalAlpha = currentOpacity;
        ctx.beginPath();
        ctx.arc(x1, y1, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Erase at position
    function eraseAtPosition(x, y) {
        const currentLayer = layers[currentLayerIndex];
        if (!currentLayer.drawing) return;

        const eraseRadius = currentWidth * 2;

        // Check each drawing element to see if it's near the erase position
        currentLayer.drawing = currentLayer.drawing.filter(item => {
            switch (item.type) {
                case 'line':
                case 'arrow':
                    return !isPointNearLine(x, y, item.x1, item.y1, item.x2, item.y2, eraseRadius);
                case 'rect':
                    return !isPointInRect(x, y, item.x, item.y, item.width, item.height, eraseRadius);
                case 'circle':
                    return !isPointInCircle(x, y, item.x, item.y, item.radius, eraseRadius);
                case 'text':
                    // Approximate text position (this is simplified)
                    return Math.abs(x - item.x) > 50 || Math.abs(y - item.y) > 20;
                case 'path':
                    return !isPointNearPath(x, y, item.points, eraseRadius);
                default:
                    return true;
            }
        });

        redrawCanvas();
    }

    // Check if point is near line
    function isPointNearLine(px, py, x1, y1, x2, y2, radius) {
        // Simplified distance from point to line segment
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) param = dot / len_sq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy) < radius;
    }

    // Check if point is in rectangle (with padding)
    function isPointInRect(px, py, rx, ry, rw, rh, padding) {
        return px >= rx - padding && px <= rx + rw + padding &&
            py >= ry - padding && py <= ry + rh + padding;
    }

    // Check if point is in circle (with padding)
    function isPointInCircle(px, py, cx, cy, radius, padding) {
        const distance = Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2));
        return distance <= radius + padding;
    }

    // Check if point is near path
    function isPointNearPath(px, py, points, radius) {
        for (let i = 0; i < points.length - 1; i++) {
            if (isPointNearLine(px, py, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, radius)) {
                return true;
            }
        }
        return false;
    }

    // Redraw the entire canvas
    function redrawCanvas() {
        ctx.clearRect(0, 0, strategyCanvas.width, strategyCanvas.height);

        // Draw all layers
        layers.forEach((layer, index) => {
            if (!layer.visible) return;

            if (layer.drawing) {
                layer.drawing.forEach(item => {
                    drawCanvasItem(item);
                });
            }
        });

        // Draw temporary shape (for preview while drawing)
        if (tempShape) {
            if (tempShape.type === 'rectangle') {
                ctx.strokeStyle = tempShape.color;
                ctx.lineWidth = tempShape.width;
                ctx.globalAlpha = tempShape.opacity;
                ctx.beginPath();
                ctx.rect(tempShape.x, tempShape.y, tempShape.width, tempShape.height);
                ctx.stroke();
            } else if (tempShape.type === 'circle') {
                ctx.strokeStyle = tempShape.color;
                ctx.lineWidth = tempShape.width;
                ctx.globalAlpha = tempShape.opacity;
                ctx.beginPath();
                ctx.arc(tempShape.x1, tempShape.y1, tempShape.radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (tempShape.type === 'line') {
                drawTempLine(tempShape.x1, tempShape.y1, tempShape.x2, tempShape.y2, false);
            } else if (tempShape.type === 'arrow') {
                drawTempLine(tempShape.x1, tempShape.y1, tempShape.x2, tempShape.y2, true);
            }
        }

        // Draw selection box if an item is selected
        if (selectedItem) {
            drawSelectionBox(selectedItem);
        }
    }

    // Draw selection box around an item
    function drawSelectionBox(item) {
        ctx.save();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;

        if (item.type === 'line' || item.type === 'arrow') {
            // Special handling for lines and arrows - just show handles at endpoints
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(item.x1, item.y1);
            ctx.lineTo(item.x2, item.y2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw handles at endpoints
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(item.x1, item.y1, HANDLE_SIZE, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(item.x2, item.y2, HANDLE_SIZE, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            // Standard selection box for other items
            const bbox = getItemBoundingBox(item);
            const center = getItemCenter(item);
            const angle = item.angle || 0;

            // Transform to item's rotation
            ctx.translate(center.x, center.y);
            ctx.rotate(angle);
            ctx.translate(-center.x, -center.y);

            // Draw bounding box
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(bbox.x - 5, bbox.y - 5, bbox.width + 10, bbox.height + 10);
            ctx.setLineDash([]);

            // Draw resize handles (except for text)
            if (item.type !== 'text') {
                ctx.fillStyle = '#00ffff';
                for (const handle of RESIZE_HANDLES) {
                    const handleX = bbox.x + bbox.width * handle.x - (handle.x === 0.5 ? HANDLE_SIZE / 2 : 0);
                    const handleY = bbox.y + bbox.height * handle.y - (handle.y === 0.5 ? HANDLE_SIZE / 2 : 0);

                    ctx.fillRect(handleX - HANDLE_SIZE / 2, handleY - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
                    ctx.strokeRect(handleX - HANDLE_SIZE / 2, handleY - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
                }
            }

            // Draw rotation handle (except for text and lines/arrows)
            if (item.type !== 'text' && item.type !== 'line' && item.type !== 'arrow') {
                const rotationHandleX = bbox.x + bbox.width / 2;
                const rotationHandleY = bbox.y - ROTATION_HANDLE_DISTANCE;

                // Draw line to rotation handle
                ctx.beginPath();
                ctx.moveTo(bbox.x + bbox.width / 2, bbox.y);
                ctx.lineTo(rotationHandleX, rotationHandleY);
                ctx.stroke();

                // Draw rotation handle circle
                ctx.beginPath();
                ctx.arc(rotationHandleX, rotationHandleY, HANDLE_SIZE / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    // Draw a single canvas item
    function drawCanvasItem(item) {
        ctx.save();

        // Apply rotation if the item has an angle
        if (item.angle) {
            const center = getItemCenter(item);
            ctx.translate(center.x, center.y);
            ctx.rotate(item.angle);
            ctx.translate(-center.x, -center.y);
        }

        ctx.strokeStyle = item.color;
        ctx.fillStyle = item.color;
        ctx.lineWidth = item.width;
        ctx.globalAlpha = item.opacity;

        switch (item.type) {
            case 'line':
                ctx.beginPath();
                ctx.moveTo(item.x1, item.y1);
                ctx.lineTo(item.x2, item.y2);
                ctx.stroke();
                break;

            case 'arrow':
                ctx.beginPath();
                ctx.moveTo(item.x1, item.y1);
                ctx.lineTo(item.x2, item.y2);
                ctx.stroke();
                drawArrowhead(item.x2, item.y2, Math.atan2(item.y2 - item.y1, item.x2 - item.x1));
                break;

            case 'rect':
                ctx.beginPath();
                ctx.rect(item.x, item.y, item.width, item.height);
                ctx.stroke();
                break;

            case 'circle':
                ctx.beginPath();
                ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
                ctx.stroke();
                break;

            case 'text':
                ctx.font = `${item.width * 5}px Arial`;
                ctx.fillText(item.text, item.x, item.y);
                break;

            case 'path':
                if (item.points.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(item.points[0].x, item.points[0].y);
                    for (let i = 1; i < item.points.length; i++) {
                        ctx.lineTo(item.points[i].x, item.points[i].y);
                    }
                    ctx.stroke();
                }
                break;
        }

        ctx.restore();
    }

    // Set current tool
    function setCurrentTool(tool) {
        currentTool = tool;
        selectedItem = null; // Deselect when switching tools

        // Update active state of buttons
        toolButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tool === tool);
        });

        // Update cursor
        switch (tool) {
            case 'select':
                strategyCanvas.style.cursor = 'default';
                break;
            case 'erase':
                strategyCanvas.style.cursor = 'cell';
                break;
            default:
                strategyCanvas.style.cursor = 'crosshair';
        }

        redrawCanvas();
    }

    // Add initial layer
    function addInitialLayer() {
        layers = [{
            name: 'Layer 1',
            visible: true,
            drawing: []
        }];
        currentLayerIndex = 0;
        renderLayersList();
    }

    // Add new layer
    function addNewLayer() {
        const newLayer = {
            name: `Layer ${layers.length + 1}`,
            visible: true,
            drawing: []
        };
        layers.push(newLayer);
        currentLayerIndex = layers.length - 1;
        renderLayersList();
        showNotification('New layer added', 'success');
    }

    // Confirm layer deletion
    function confirmDeleteLayer() {
        if (layers.length <= 1) {
            showNotification('Cannot delete the last layer', 'warning');
            return;
        }

        showConfirmationModal(
            'Delete Layer',
            'Are you sure you want to delete this layer? All drawings on this layer will be lost.',
            () => {
                layers.splice(currentLayerIndex, 1);
                if (currentLayerIndex >= layers.length) {
                    currentLayerIndex = layers.length - 1;
                }
                renderLayersList();
                redrawCanvas();
                showNotification('Layer deleted', 'success');
            }
        );
    }

    // Render layers list
    function renderLayersList() {
        layersList.innerHTML = '';

        layers.forEach((layer, index) => {
            const layerItem = document.createElement('div');
            layerItem.className = `layer-item ${index === currentLayerIndex ? 'active' : ''}`;
            layerItem.innerHTML = `
                <i class="fas fa-eye${layer.visible ? '' : '-slash'} layer-visibility" data-index="${index}"></i>
                <span class="layer-name">${layer.name}</span>
            `;
            layerItem.addEventListener('click', () => {
                currentLayerIndex = index;
                renderLayersList();
                redrawCanvas();
            });

            const visibilityIcon = layerItem.querySelector('.layer-visibility');
            visibilityIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                layer.visible = !layer.visible;
                visibilityIcon.className = `fas fa-eye${layer.visible ? '' : '-slash'} layer-visibility`;
                redrawCanvas();
            });

            layersList.appendChild(layerItem);
        });

        // Disable delete/rename buttons if only one layer exists
        deleteLayerBtn.disabled = layers.length <= 1;
        renameLayerBtn.disabled = layers.length === 0;
    }

    // Save canvas state for undo
    function saveCanvasState() {
        // Remove any states after current index (if we're not at the end)
        if (currentStateIndex < canvasStates.length - 1) {
            canvasStates = canvasStates.slice(0, currentStateIndex + 1);
        }

        // Save current state
        const state = {
            layers: JSON.parse(JSON.stringify(layers)),
            currentLayerIndex: currentLayerIndex
        };

        canvasStates.push(state);
        currentStateIndex = canvasStates.length - 1;

        // Limit history size
        if (canvasStates.length > 20) {
            canvasStates.shift();
            currentStateIndex--;
        }
    }

    // Undo last action
    function undo() {
        if (currentStateIndex <= 0) return;

        currentStateIndex--;
        const state = canvasStates[currentStateIndex];
        layers = JSON.parse(JSON.stringify(state.layers));
        currentLayerIndex = state.currentLayerIndex;
        selectedItem = null;

        renderLayersList();
        redrawCanvas();
    }

    // Redo last undone action
    function redo() {
        if (currentStateIndex >= canvasStates.length - 1) return;

        currentStateIndex++;
        const state = canvasStates[currentStateIndex];
        layers = JSON.parse(JSON.stringify(state.layers));
        currentLayerIndex = state.currentLayerIndex;
        selectedItem = null;

        renderLayersList();
        redrawCanvas();
    }

    // Confirm canvas clearing
    function confirmClearCanvas() {
        showConfirmationModal(
            'Clear Canvas',
            'Are you sure you want to clear the current layer? All drawings will be lost.',
            clearCanvas
        );
    }

    // Clear canvas
    function clearCanvas() {
        const currentLayer = layers[currentLayerIndex];
        currentLayer.drawing = [];
        selectedItem = null;
        saveCanvasState();
        redrawCanvas();
        showNotification('Canvas cleared', 'success');
    }

    // Save plan
    function savePlan() {
        if (planTitle.value.length > 100) {
            showNotification('Plan title must be 100 characters or less', 'error');
            return;
        }

        if (planDescription.value.length > 250) {
            showNotification('Plan description must be 250 characters or less', 'error');
            return;
        }

        const planData = {
            map: currentMap,
            title: planTitle.value,
            description: planDescription.value,
            layers: layers,
            createdAt: new Date().toISOString()
        };

        const shareCode = encodePlan(planData);
        showShareCodeModal(shareCode);
    }

    // Encode plan data to a shareable code
    function encodePlan(planData) {
        try {
            const jsonStr = JSON.stringify(planData);
            const compressed = LZString.compressToEncodedURIComponent(jsonStr);
            return `PCWSTRAT-${compressed}`;
        } catch (error) {
            console.error('Error encoding plan:', error);
            return '';
        }
    }

    // Decode share code to plan data
    function decodePlan(code) {
        try {
            if (!code.startsWith('PCWSTRAT-')) {
                throw new Error('Invalid plan code format');
            }

            const compressed = code.substring(9);
            const jsonStr = LZString.decompressFromEncodedURIComponent(compressed);
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Error decoding plan:', error);
            return null;
        }
    }

    // Show text input modal
    function showTextInputModal() {
        textInputField.value = '';
        textInputModal.classList.remove('hidden');
        textInputField.focus();
    }

    // Hide text input modal
    function hideTextInputModal() {
        textInputModal.classList.add('hidden');
    }

    // Confirm text input
    function confirmTextInput() {
        const text = textInputField.value.trim();
        if (text) {
            const currentLayer = layers[currentLayerIndex];
            currentLayer.drawing = currentLayer.drawing || [];
            currentLayer.drawing.push({
                type: 'text',
                x: pendingTextPosition.x,
                y: pendingTextPosition.y,
                text: text,
                color: currentColor,
                width: currentWidth,
                opacity: currentOpacity
            });
            redrawCanvas();
            hideTextInputModal();
        }
    }

    // Show confirmation modal
    function showConfirmationModal(title, message, callback) {
        confirmationTitle.textContent = title;
        confirmationMessage.textContent = message;
        confirmationModal.classList.remove('hidden');

        // Store the callback
        confirmActionBtn.onclick = () => {
            callback();
            hideConfirmationModal();
        };
    }

    // Hide confirmation modal
    function hideConfirmationModal() {
        confirmationModal.classList.add('hidden');
    }

    // Execute confirmed action
    function executeConfirmedAction() {
        hideConfirmationModal();
    }

    // Show custom notification
    function showNotification(message, type = 'info') {
        notificationMessage.textContent = message;

        // Set icon and color based on type
        let iconClass = 'fa-info-circle';
        let notificationClass = 'info';

        switch (type) {
            case 'success':
                iconClass = 'fa-check-circle';
                notificationClass = 'success';
                break;
            case 'error':
                iconClass = 'fa-exclamation-circle';
                notificationClass = 'error';
                break;
            case 'warning':
                iconClass = 'fa-exclamation-triangle';
                notificationClass = 'warning';
                break;
        }

        notificationIcon.className = `fas ${iconClass} mr-3`;
        customNotification.className = `fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg border border-gray-700 transform translate-y-10 opacity-0 transition-all duration-300 z-50 ${notificationClass}`;

        // Show notification
        customNotification.classList.remove('hidden');
        setTimeout(() => {
            customNotification.classList.add('show');
        }, 10);

        // Hide after 5 seconds
        setTimeout(() => {
            customNotification.classList.remove('show');
            setTimeout(() => {
                customNotification.classList.add('hidden');
            }, 300);
        }, 5000);
    }

    // Initialize the app
    init();

    // Handle window resize
    window.addEventListener('resize', function() {
        if (strategyPlanner.classList.contains('hidden')) return;
        resizeCanvas();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Don't trigger if focused on input fields
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        // Ctrl+Z for undo
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        }

        // Ctrl+Y for redo
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redo();
        }
    });
});