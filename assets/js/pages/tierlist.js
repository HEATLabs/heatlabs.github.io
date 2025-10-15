document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const selectionScreen = document.getElementById('selectionScreen');
    const tierListCreator = document.getElementById('tierListCreator');
    const tierListTitle = document.getElementById('tierListTitle');
    const backButton = document.getElementById('backButton');
    const unrankedItems = document.getElementById('unrankedItems');
    const resetButton = document.getElementById('resetTierList');
    const saveButton = document.getElementById('saveTierList');
    const shareButton = document.getElementById('shareTierList');
    const loadTierListInput = document.getElementById('loadTierListInput');
    const loadTierListButton = document.getElementById('loadTierListButton');

    // Modal elements
    const resetModal = document.createElement('div');
    resetModal.className = 'reset-modal hidden';
    resetModal.innerHTML = `
        <div class="reset-modal-content">
            <h3>Reset Tier List</h3>
            <p>Are you sure you want to reset this tier list? All your rankings will be lost.</p>
            <div class="reset-modal-buttons">
                <button class="reset-modal-cancel">Cancel</button>
                <button class="reset-modal-confirm">Reset</button>
            </div>
        </div>
    `;

    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal hidden';
    shareModal.innerHTML = `
        <div class="share-modal-content">
            <h3>Share Your Tier List</h3>
            <p>Your <span class="share-category"></span> tier list has been saved and is ready to be shared!</p>
            <div class="share-url-container">
                <input type="text" class="share-url-input" readonly>
                <button class="copy-url-button">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
            <button class="share-modal-close">Close</button>
        </div>
    `;

    document.body.appendChild(resetModal);
    document.body.appendChild(shareModal);

    // Tier list data
    let currentType = '';
    let items = [];
    const tierLists = {
        tanks: null,
        maps: null,
        agents: null
    };

    // Touch drag variables
    let touchStartX = 0;
    let touchStartY = 0;
    let draggedItem = null;
    let draggedItemOriginalParent = null;
    let draggedItemOriginalIndex = 0;
    let draggedItemClone = null;
    let isDragging = false;

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

        // Share button
        shareButton.addEventListener('click', shareCurrentTierList);

        // Load tier list button
        loadTierListButton.addEventListener('click', loadSharedTierList);

        // Modal event listeners
        resetModal.querySelector('.reset-modal-cancel').addEventListener('click', hideResetModal);
        resetModal.querySelector('.reset-modal-confirm').addEventListener('click', confirmReset);

        shareModal.querySelector('.share-modal-close').addEventListener('click', hideShareModal);
        shareModal.querySelector('.copy-url-button').addEventListener('click', copyShareUrl);

        // Check for shared tier list in URL
        checkForSharedTierList();
    }

    // Check URL for shared tier list
    function checkForSharedTierList() {
        const params = new URLSearchParams(window.location.search);
        const sharedData = params.get('tierlist');

        if (sharedData) {
            try {
                // Decompress the URL using LZString
                const decompressed = LZString.decompressFromEncodedURIComponent(sharedData);
                if (!decompressed) throw new Error('Invalid compressed data');

                const parsedData = JSON.parse(decompressed);
                const {
                    t: type,
                    i: itemData
                } = parsedData;

                // Set the current type and load the tier list
                currentType = type;
                loadTierList(type).then(() => {
                    // Apply the shared tier list
                    applySavedTierList(itemData);

                    // Show a message that a shared tier list was loaded
                    showNotification(`Loaded shared ${type} tier list`);
                });
            } catch (e) {
                console.error('Error loading shared tier list:', e);
                showNotification('Invalid shared tier list URL', 'error');
            }
        }
    }

    // Show reset confirmation modal
    function showResetModal() {
        resetModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }

    // Hide reset confirmation modal
    function hideResetModal() {
        resetModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }

    // Show share modal
    function showShareModal() {
        shareModal.querySelector('.share-category').textContent = currentType;
        shareModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }

    // Hide share modal
    function hideShareModal() {
        shareModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }

    // Copy share URL to clipboard
    function copyShareUrl() {
        const urlInput = shareModal.querySelector('.share-url-input');
        urlInput.select();
        document.execCommand('copy');
        hideShareModal();
        showNotification('URL copied to clipboard!');
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

        const tierListData = getCurrentTierListData();
        localStorage.setItem(`tierList_${currentType}`, JSON.stringify(tierListData));
        showNotification('Tier list saved successfully!');
    }

    // Share the current tier list
    function shareCurrentTierList() {
        if (!currentType) return;

        // First save the tier list
        saveCurrentTierList();

        // Get current tier list data
        const tierListData = getCurrentTierListData();

        // Create a minimal shareable data structure
        const shareData = {
            t: currentType, // Shortened property name
            i: tierListData.items // Shortened property name
        };

        // Compress the data using LZString
        const compressedData = LZString.compressToEncodedURIComponent(JSON.stringify(shareData));
        const shareUrl = `${window.location.origin}${window.location.pathname}?tierlist=${compressedData}`;

        // Show the share modal with the URL
        const urlInput = shareModal.querySelector('.share-url-input');
        urlInput.value = shareUrl;
        showShareModal();
    }

    // Get current tier list data
    function getCurrentTierListData() {
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

        return tierListData;
    }

    // Load a shared tier list
    function loadSharedTierList() {
        const url = loadTierListInput.value.trim();

        if (!url) {
            showNotification('Please enter a valid URL', 'error');
            return;
        }

        try {
            // Extract the tierlist parameter from the URL
            const urlObj = new URL(url);
            const sharedData = urlObj.searchParams.get('tierlist');

            if (!sharedData) {
                throw new Error('No tier list data found in URL');
            }

            // Decompress the URL using LZString
            const decompressed = LZString.decompressFromEncodedURIComponent(sharedData);
            if (!decompressed) throw new Error('Invalid compressed data');

            const parsedData = JSON.parse(decompressed);
            const {
                t: type,
                i: itemData
            } = parsedData;

            // Set the current type and load the tier list
            currentType = type;
            loadTierList(type).then(() => {
                // Apply the shared tier list
                applySavedTierList(itemData);

                // Show a message that a shared tier list was loaded
                showNotification(`Loaded shared ${type} tier list`);

                // Clear the input
                loadTierListInput.value = '';
            });
        } catch (e) {
            console.error('Error loading shared tier list:', e);
            showNotification('Invalid shared tier list URL', 'error');
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `save-notification ${type}`;
        notification.textContent = message;
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
                applySavedTierList(savedData.items);
            }

            // Initialize drag and drop
            initDragAndDrop();

        } catch (error) {
            console.error('Error loading tier list data:', error);
            tierListTitle.textContent = 'Error loading data';
            showNotification('Error loading data', 'error');
        }
    }

    // Apply saved tier list data to the UI
    function applySavedTierList(itemData) {
        Object.entries(itemData).forEach(([itemId, tier]) => {
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
        const response = await fetch('"https://cdn1.heatlabs.net/tanks.json');
        const data = await response.json();
        return data.map(tank => ({
            id: tank.id.toString(), // Ensure ID is string for consistency
            name: tank.name,
            image: tank.image,
            type: 'tank'
        }));
    }

    // Load maps data
    async function loadMaps() {
        const response = await fetch('"https://cdn1.heatlabs.net/maps.json');
        const data = await response.json();
        return data.maps.map(map => ({
            id: map.id.toString(), // Use the ID from JSON
            name: map.name,
            image: map.image,
            type: 'map'
        }));
    }

    // Load agents data
    async function loadAgents() {
        const response = await fetch('"https://cdn1.heatlabs.net/agents.json');
        const data = await response.json();
        return data.agents.map(agent => ({
            id: agent.id.toString(), // Use the ID from JSON
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
            <img src="${item.image}" alt="${item.name}" draggable="false">
            <div class="item-name">${item.name}</div>
        `;

        return itemElement;
    }

    // Initialize drag and drop functionality
    function initDragAndDrop() {
        const items = document.querySelectorAll('.tier-item');
        const containers = document.querySelectorAll('.tier-items, .unranked-items');

        // Remove all existing event listeners first
        items.forEach(item => {
            item.removeEventListener('dragstart', dragStart);
            item.removeEventListener('dragend', dragEnd);
            item.removeEventListener('touchstart', handleTouchStart);
            item.removeEventListener('touchmove', handleTouchMove);
            item.removeEventListener('touchend', handleTouchEnd);
        });

        containers.forEach(container => {
            container.removeEventListener('dragover', dragOver);
            container.removeEventListener('dragenter', dragEnter);
            container.removeEventListener('dragleave', dragLeave);
            container.removeEventListener('drop', drop);
            container.removeEventListener('touchmove', handleContainerTouchMove);
            container.removeEventListener('touchend', handleContainerTouchEnd);
        });

        // Add new event listeners
        items.forEach(item => {
            // Mouse events
            item.addEventListener('dragstart', dragStart);
            item.addEventListener('dragend', dragEnd);

            // Touch events
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
            item.addEventListener('touchmove', handleTouchMove, { passive: false });
            item.addEventListener('touchend', handleTouchEnd);
        });

        containers.forEach(container => {
            // Mouse events
            container.addEventListener('dragover', dragOver);
            container.addEventListener('dragenter', dragEnter);
            container.addEventListener('dragleave', dragLeave);
            container.addEventListener('drop', drop);

            // Touch events
            container.addEventListener('touchmove', handleContainerTouchMove, { passive: false });
            container.addEventListener('touchend', handleContainerTouchEnd);
        });
    }

    // Mouse drag and drop event handlers
    function dragStart(e) {
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
    }

    function dragEnd() {
        this.classList.remove('dragging');
    }

    function dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
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
        const isDragging = document.querySelector('.dragging');

        if (draggedItem && isDragging) {
            // Get the mouse position
            const dropY = e.clientY;

            // Get all items in the container
            const itemsInContainer = [...this.querySelectorAll('.tier-item:not(.dragging)')];

            // Find the closest item based on position
            const closestItem = itemsInContainer.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = dropY - box.top - box.height / 2;

                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY });

            if (closestItem.element) {
                this.insertBefore(draggedItem, closestItem.element);
            } else {
                this.appendChild(draggedItem);
            }
        }
    }

    // Touch event handlers
    function handleTouchStart(e) {
        if (isDragging) return;

        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        draggedItem = this;
        draggedItemOriginalParent = this.parentNode;
        draggedItemOriginalIndex = Array.from(this.parentNode.children).indexOf(this);

        // Create a clone for visual feedback
        draggedItemClone = this.cloneNode(true);
        draggedItemClone.style.position = 'fixed';
        draggedItemClone.style.zIndex = '1000';
        draggedItemClone.style.width = `${this.offsetWidth}px`;
        draggedItemClone.style.height = `${this.offsetHeight}px`;
        draggedItemClone.style.left = `${this.getBoundingClientRect().left}px`;
        draggedItemClone.style.top = `${this.getBoundingClientRect().top}px`;
        draggedItemClone.style.pointerEvents = 'none';
        draggedItemClone.classList.add('dragging');
        document.body.appendChild(draggedItemClone);

        // Hide original while dragging
        this.style.visibility = 'hidden';

        isDragging = true;
        e.preventDefault();
    }

    function handleTouchMove(e) {
        if (!isDragging) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        // Move the clone
        draggedItemClone.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Find the container under the touch point
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        const elementUnderTouch = document.elementFromPoint(touchX, touchY);
        const container = elementUnderTouch.closest('.tier-items, .unranked-items');

        // Highlight potential drop target
        document.querySelectorAll('.tier-items, .unranked-items').forEach(el => {
            el.classList.remove('drag-over');
        });

        if (container) {
            container.classList.add('drag-over');
        }

        e.preventDefault();
    }

    function handleTouchEnd(e) {
        if (!isDragging) return;

        // Find the container under the touch point
        const touch = e.changedTouches[0];
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        const elementUnderTouch = document.elementFromPoint(touchX, touchY);
        const container = elementUnderTouch.closest('.tier-items, .unranked-items');

        // Remove highlight from all containers
        document.querySelectorAll('.tier-items, .unranked-items').forEach(el => {
            el.classList.remove('drag-over');
        });

        // Move the item to the new container if valid
        if (container) {
            container.appendChild(draggedItem);
        } else {
            // Return to original position if no valid container
            if (draggedItemOriginalParent && draggedItemOriginalParent.children[draggedItemOriginalIndex]) {
                draggedItemOriginalParent.insertBefore(draggedItem, draggedItemOriginalParent.children[draggedItemOriginalIndex]);
            } else {
                draggedItemOriginalParent.appendChild(draggedItem);
            }
        }

        // Clean up
        draggedItem.style.visibility = '';
        draggedItemClone.remove();
        draggedItem = null;
        draggedItemClone = null;
        isDragging = false;
    }

    function handleContainerTouchMove(e) {
        if (!isDragging) return;
        e.preventDefault();
    }

    function handleContainerTouchEnd(e) {
        if (!isDragging) return;
        e.preventDefault();
    }

    // Initialize the app
    init();
});