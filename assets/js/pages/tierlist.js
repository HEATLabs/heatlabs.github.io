document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const selectionScreen = document.getElementById('selectionScreen');
    const tierListCreator = document.getElementById('tierListCreator');
    const tierListTitle = document.getElementById('tierListTitle');
    const backButton = document.getElementById('backButton');
    const unrankedItems = document.getElementById('unrankedItems');
    const resetButton = document.getElementById('resetTierList');
    const saveButton = document.getElementById('saveTierList');

    // Modal elements
    const modal = document.createElement('div');
    modal.className = 'reset-modal hidden';
    modal.innerHTML = `
        <div class="reset-modal-content">
            <h3>Reset Tier List</h3>
            <p>Are you sure you want to reset this tier list? All your rankings will be lost.</p>
            <div class="reset-modal-buttons">
                <button class="reset-modal-cancel">Cancel</button>
                <button class="reset-modal-confirm">Reset</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Tier list data
    let currentType = '';
    let items = [];
    let tierLists = {
        tanks: null,
        maps: null,
        agents: null
    };

    // Initialize the tier list creator
    function init() {
        // Add event listeners to tier options
        document.querySelectorAll('.tier-option').forEach(option => {
            option.addEventListener('click', function() {
                currentType = this.dataset.type;
                loadTierList(currentType);
            });
        });

        // Back button
        backButton.addEventListener('click', () => {
            tierListCreator.classList.add('hidden');
            selectionScreen.classList.remove('hidden');
        });

        // Reset button
        resetButton.addEventListener('click', showResetModal);

        // Save button
        saveButton.addEventListener('click', saveCurrentTierList);

        // Modal event listeners
        modal.querySelector('.reset-modal-cancel').addEventListener('click', hideResetModal);
        modal.querySelector('.reset-modal-confirm').addEventListener('click', confirmReset);
    }

    // Show reset confirmation modal
    function showResetModal() {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Hide reset confirmation modal
    function hideResetModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Confirm reset and execute
    function confirmReset() {
        hideResetModal();
        // Clear saved data for current type
        localStorage.removeItem(`tierList_${currentType}`);
        renderTierList();
        initDragAndDrop();
    }

    // Save the current tier list to localStorage
    function saveCurrentTierList() {
        if (!currentType) return;

        const tierListData = {
            items: {},
            timestamp: new Date().toISOString()
        };

        // Get all tier containers (including unranked)
        const allContainers = document.querySelectorAll('.tier-items, .unranked-items');

        allContainers.forEach(container => {
            const tier = container.dataset.tier || 'unranked';
            const itemElements = container.querySelectorAll('.tier-item');

            itemElements.forEach(item => {
                tierListData.items[item.dataset.id] = tier;
            });
        });

        // Save to localStorage
        localStorage.setItem(`tierList_${currentType}`, JSON.stringify(tierListData));

        // Show save confirmation
        showSaveConfirmation();
    }

    // Show save confirmation
    function showSaveConfirmation() {
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.textContent = 'Tier list saved successfully!';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }

    // Load saved tier list data
    function loadSavedTierList(type) {
        const savedData = localStorage.getItem(`tierList_${type}`);
        if (savedData) {
            return JSON.parse(savedData);
        }
        return null;
    }

    // Load the appropriate tier list based on type
    async function loadTierList(type) {
        // Show loading state
        tierListTitle.textContent = `Loading ${type} data...`;
        selectionScreen.classList.add('hidden');
        tierListCreator.classList.remove('hidden');

        try {
            // Load data based on type
            switch (type) {
                case 'tanks':
                    items = await loadTanks();
                    break;
                case 'maps':
                    items = await loadMaps();
                    break;
                case 'agents':
                    items = await loadAgents();
                    break;
                default:
                    throw new Error('Invalid tier list type');
            }

            // Update UI
            tierListTitle.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Tier List`;
            renderTierList();

            // Load saved data if exists
            const savedData = loadSavedTierList(type);
            if (savedData) {
                applySavedTierList(savedData);
            }

            // Initialize drag and drop
            initDragAndDrop();

        } catch (error) {
            console.error('Error loading tier list data:', error);
            tierListTitle.textContent = 'Error loading data';
            // Show error message to user
        }
    }

    // Apply saved tier list data to the UI
    function applySavedTierList(savedData) {
        Object.entries(savedData.items).forEach(([itemId, tier]) => {
            const itemElement = document.querySelector(`.tier-item[data-id="${itemId}"]`);
            if (itemElement) {
                const container = tier === 'unranked' ?
                    unrankedItems :
                    document.querySelector(`.tier-items[data-tier="${tier}"]`);
                if (container) {
                    container.appendChild(itemElement);
                }
            }
        });
    }

    // Load tanks data
    async function loadTanks() {
        const response = await fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/tanks.json');
        const data = await response.json();
        return data.map(tank => ({
            id: tank.id,
            name: tank.name,
            image: tank.image,
            type: 'tank'
        }));
    }

    // Load maps data
    async function loadMaps() {
        const response = await fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/maps.json');
        const data = await response.json();
        return data.maps.map(map => ({
            id: map.name.toLowerCase().replace(/\s+/g, '-'),
            name: map.name,
            image: map.image,
            type: 'map'
        }));
    }

    // Load agents data
    async function loadAgents() {
        const response = await fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/agents.json');
        const data = await response.json();
        return data.agents.map(agent => ({
            id: agent.name.toLowerCase(),
            name: agent.name,
            image: agent.image,
            type: 'agent'
        }));
    }

    // Render the tier list with items
    function renderTierList() {
        // Clear existing items
        unrankedItems.innerHTML = '';
        document.querySelectorAll('.tier-items').forEach(el => el.innerHTML = '');

        // Create draggable items for each item
        items.forEach(item => {
            const itemElement = createItemElement(item);
            unrankedItems.appendChild(itemElement);
        });
    }

    // Create a draggable item element
    function createItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'tier-item';
        itemElement.draggable = true;
        itemElement.dataset.id = item.id;
        itemElement.dataset.type = item.type;

        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-name">${item.name}</div>
        `;

        return itemElement;
    }

    // Initialize drag and drop functionality
    function initDragAndDrop() {
        const items = document.querySelectorAll('.tier-item');

        items.forEach(item => {
            item.addEventListener('dragstart', dragStart);
            item.addEventListener('dragend', dragEnd);
        });

        const tierItemsContainers = document.querySelectorAll('.tier-items, .unranked-items');

        tierItemsContainers.forEach(container => {
            container.addEventListener('dragover', dragOver);
            container.addEventListener('dragenter', dragEnter);
            container.addEventListener('dragleave', dragLeave);
            container.addEventListener('drop', drop);
        });
    }

    // Drag and drop event handlers
    function dragStart(e) {
        e.dataTransfer.setData('text/plain', this.dataset.id);
        setTimeout(() => this.classList.add('dragging'), 0);
    }

    function dragEnd() {
        this.classList.remove('dragging');
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dragEnter(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function dragLeave() {
        this.classList.remove('drag-over');
    }

    function drop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        const id = e.dataTransfer.getData('text/plain');
        const draggedItem = document.querySelector(`.tier-item[data-id="${id}"]`);

        if (draggedItem) {
            this.appendChild(draggedItem);
        }
    }

    // Initialize the app
    init();
});