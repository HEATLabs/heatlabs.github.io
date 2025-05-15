document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const initialChoiceModal = document.getElementById('initialChoiceModal');
    const createNewPlanBtn = document.getElementById('createNewPlanBtn');
    const loadExistingPlanBtn = document.getElementById('loadExistingPlanBtn');
    const mapSelectionGrid = document.getElementById('mapSelectionGrid');
    const strategyPlanner = document.getElementById('strategyPlanner');
    const loadPlanModal = document.getElementById('loadPlanModal');
    const loadPlanBtn = document.getElementById('loadPlanBtn');
    const cancelLoadBtn = document.getElementById('cancelLoadBtn');
    const planCodeInput = document.getElementById('planCodeInput');
    const backToMapsBtn = document.getElementById('backToMapsBtn');
    const savePlanBtn = document.getElementById('savePlanBtn');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    const planTitle = document.getElementById('planTitle');
    const planDescription = document.getElementById('planDescription');
    const shareCode = document.getElementById('shareCode');
    const copyShareCode = document.getElementById('copyShareCode');
    const mapImage = document.getElementById('mapImage');
    const strategyCanvas = document.getElementById('strategyCanvas');
    const ctx = strategyCanvas.getContext('2d');
    const toolButtons = document.querySelectorAll('.tool-btn');
    const colorPicker = document.getElementById('colorPicker');
    const widthSlider = document.getElementById('widthSlider');
    const opacitySlider = document.getElementById('opacitySlider');
    const addLayerBtn = document.getElementById('addLayerBtn');
    const deleteLayerBtn = document.getElementById('deleteLayerBtn');
    const layersList = document.getElementById('layersList');

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
        updateShareCode();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Initial choice modal
        createNewPlanBtn.addEventListener('click', showMapSelection);
        loadExistingPlanBtn.addEventListener('click', showLoadPlanModal);

        // Load plan modal
        loadPlanBtn.addEventListener('click', loadPlanFromCode);
        cancelLoadBtn.addEventListener('click', hideLoadPlanModal);
        planCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadPlanFromCode();
            }
        });

        // Planner actions
        backToMapsBtn.addEventListener('click', showMapSelection);
        savePlanBtn.addEventListener('click', savePlan);
        clearCanvasBtn.addEventListener('click', clearCanvas);
        copyShareCode.addEventListener('click', copyCodeToClipboard);

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
        });

        opacitySlider.addEventListener('input', function() {
            currentOpacity = this.value / 100;
        });

        // Layer controls
        addLayerBtn.addEventListener('click', addNewLayer);
        deleteLayerBtn.addEventListener('click', deleteCurrentLayer);
    }

    // Render the map selection grid
    function renderMapGrid() {
        const mapGrid = document.querySelector('.map-grid');
        mapGrid.innerHTML = '';

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
            mapGrid.appendChild(mapItem);
        });
    }

    // Show map selection grid
    function showMapSelection() {
        initialChoiceModal.classList.remove('active');
        mapSelectionGrid.classList.remove('hidden');
        strategyPlanner.classList.add('hidden');
        loadPlanModal.classList.add('hidden');
    }

    // Select a map and show the planner
    function selectMap(mapId) {
        const selectedMap = maps.find(map => map.id === mapId);
        if (!selectedMap) return;

        currentMap = mapId;
        mapImage.src = selectedMap.image;
        mapSelectionGrid.classList.add('hidden');
        strategyPlanner.classList.remove('hidden');

        // Reset canvas size based on the image
        setTimeout(() => {
            resizeCanvas();
            redrawCanvas();
        }, 100);
    }

    // Show load plan modal
    function showLoadPlanModal() {
        initialChoiceModal.classList.remove('active');
        loadPlanModal.classList.remove('hidden');
        planCodeInput.focus();
    }

    // Hide load plan modal
    function hideLoadPlanModal() {
        loadPlanModal.classList.add('hidden');
    }

    // Load plan from share code
    function loadPlanFromCode() {
        const code = planCodeInput.value.trim();
        if (!code) return;

        try {
            const planData = decodePlan(code);
            if (!planData) throw new Error('Invalid plan code');

            currentMap = planData.map;
            planTitle.value = planData.title || '';
            planDescription.value = planData.description || '';

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
            initialChoiceModal.classList.remove('active');
            mapSelectionGrid.classList.add('hidden');
            loadPlanModal.classList.add('hidden');
            strategyPlanner.classList.remove('hidden');

            // Redraw canvas
            setTimeout(() => {
                resizeCanvas();
                redrawCanvas();
            }, 100);

        } catch (error) {
            alert('Failed to load plan. Please check the share code and try again.');
            console.error('Error loading plan:', error);
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

        // For text tool, prompt for text
        if (currentTool === 'text') {
            const text = prompt('Enter text:', '');
            if (text) {
                const currentLayer = layers[currentLayerIndex];
                currentLayer.drawing = currentLayer.drawing || [];
                currentLayer.drawing.push({
                    type: 'text',
                    x: lastX,
                    y: lastY,
                    text: text,
                    color: currentColor,
                    width: currentWidth,
                    opacity: currentOpacity
                });
                redrawCanvas();
            }
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
    }

    // Delete current layer
    function deleteCurrentLayer() {
        if (layers.length <= 1) return;

        layers.splice(currentLayerIndex, 1);
        if (currentLayerIndex >= layers.length) {
            currentLayerIndex = layers.length - 1;
        }
        renderLayersList();
        redrawCanvas();
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

    // Clear canvas
    function clearCanvas() {
        if (!confirm('Are you sure you want to clear the canvas?')) return;

        const currentLayer = layers[currentLayerIndex];
        currentLayer.drawing = [];
        saveCanvasState();
        redrawCanvas();
    }

    // Save plan
    function savePlan() {
        const planData = {
            map: currentMap,
            title: planTitle.value,
            description: planDescription.value,
            layers: layers,
            createdAt: new Date().toISOString()
        };

        updateShareCode();
        alert('Plan saved! Use the share code to load it later or share with others.');
    }

    // Update share code
    function updateShareCode() {
        const planData = {
            map: currentMap,
            title: planTitle.value,
            description: planDescription.value,
            layers: layers
        };

        shareCode.value = encodePlan(planData);
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

    // Copy share code to clipboard
    function copyCodeToClipboard() {
        shareCode.select();
        document.execCommand('copy');

        // Show feedback
        const originalText = copyShareCode.innerHTML;
        copyShareCode.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyShareCode.innerHTML = originalText;
        }, 2000);
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