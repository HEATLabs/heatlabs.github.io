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

    // Map data
    const maps = [{
            id: 'blossom_crash',
            name: 'Blossom Crash',
            image: 'https://github.com/PCWStats/Website-Images/blob/main/strat-planner/blossom_crash_radar.png?raw=true'
        },
        {
            id: 'nord_oko',
            name: 'Nord Oko',
            image: 'https://github.com/PCWStats/Website-Images/blob/main/strat-planner/nord_oko_radar.png?raw=true'
        },
        {
            id: 'scarred_city',
            name: 'Scarred City',
            image: 'https://github.com/PCWStats/Website-Images/blob/main/strat-planner/scarred_city_radar.png?raw=true'
        },
        {
            id: 'sunstroke',
            name: 'Sunstroke',
            image: 'https://github.com/PCWStats/Website-Images/blob/main/strat-planner/sunstroke_radar.png?raw=true'
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
        });

        widthSlider.addEventListener('input', function() {
            currentWidth = this.value;
            widthValue.textContent = currentWidth;
        });

        opacitySlider.addEventListener('input', function() {
            currentOpacity = this.value / 100;
            opacityValue.textContent = `${this.value}%`;
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
    }

    // Draw on canvas
    function draw(e) {
        if (!isDrawing) return;

        const pos = getCanvasPosition(e);
        const x = pos.x;
        const y = pos.y;

        const currentLayer = layers[currentLayerIndex];

        switch (currentTool) {
            case 'line':
            case 'arrow':
                // For line/arrow, we'll draw it on mouse up
                redrawCanvas();
                drawTempLine(lastX, lastY, x, y, currentTool === 'arrow');
                break;

            case 'rectangle':
                redrawCanvas();
                drawTempRect(lastX, lastY, x, y);
                break;

            case 'circle':
                redrawCanvas();
                drawTempCircle(lastX, lastY, x, y);
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
        if (!isDrawing) return;
        isDrawing = false;

        const currentLayer = layers[currentLayerIndex];

        // For shapes, add them to the layer when done
        if (currentTool === 'line' || currentTool === 'arrow') {
            currentLayer.drawing = currentLayer.drawing || [];
            currentLayer.drawing.push({
                type: currentTool,
                x1: lastX,
                y1: lastY,
                x2: lastX,
                y2: lastY,
                color: currentColor,
                width: currentWidth,
                opacity: currentOpacity
            });
        } else if (currentTool === 'rectangle') {
            currentLayer.drawing.push({
                type: 'rect',
                x: lastX,
                y: lastY,
                width: 0,
                height: 0,
                color: currentColor,
                width: currentWidth,
                opacity: currentOpacity
            });
        } else if (currentTool === 'circle') {
            currentLayer.drawing.push({
                type: 'circle',
                x: lastX,
                y: lastY,
                radius: 0,
                color: currentColor,
                width: currentWidth,
                opacity: currentOpacity
            });
        }

        redrawCanvas();
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
    }

    // Draw a single canvas item
    function drawCanvasItem(item) {
        ctx.save();
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