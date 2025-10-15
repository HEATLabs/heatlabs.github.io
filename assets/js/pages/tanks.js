document.addEventListener('DOMContentLoaded', function() {
    // Initialize filters
    const filters = {
        nation: [],
        type: [],
        status: []
    };

document.addEventListener('click', function(event) {
    const sidebar = document.querySelector('.comparison-sidebar');
    const trigger = document.querySelector('.comparison-trigger');

    // If sidebar exists and is open, and click is outside of it
    if (sidebar && sidebar.classList.contains('open') &&
        !sidebar.contains(event.target) &&
        event.target !== trigger &&
        !trigger.contains(event.target)) {
        toggleSidebar(event);
    }
});

    // DOM elements
    const activeFiltersContainer = document.querySelector('.active-filters');
    const noFiltersMessage = document.querySelector('.no-filters-message');
    const tanksGrid = document.querySelector('.tanks-grid');
    let tankCards = []; // Will store references to all tank cards

    // Comparison elements and data
    const comparisonModal = document.getElementById('comparisonModal');
    const comparisonTanksContainer = document.getElementById('comparisonTanksContainer');
    const clearComparisonBtn = document.getElementById('clearComparison');
    const openComparisonBtn = document.getElementById('openComparison');
    const comparisonCount = document.getElementById('comparisonCount');
    let comparisonData = JSON.parse(localStorage.getItem('tankComparison')) || [];

    // Create comparison sidebar elements
    function initComparisonSidebar() {
        // Check if sidebar already exists
        if (document.querySelector('.comparison-sidebar')) return;

        // Create overlay
        const comparisonOverlay = document.createElement('div');
        comparisonOverlay.className = 'comparison-overlay';
        comparisonOverlay.style.display = 'none';
        document.body.appendChild(comparisonOverlay);

        // Create sidebar
        const comparisonSidebar = document.createElement('div');
        comparisonSidebar.className = 'comparison-sidebar';
        comparisonSidebar.innerHTML = `
            <div class="comparison-sidebar-header">
                <h3 class="comparison-sidebar-title">Tank Comparison</h3>
                <button class="comparison-sidebar-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="comparison-tanks-list"></div>
            <div class="comparison-sidebar-footer">
                <button class="btn-add-all">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Add All
                </button>
                <button class="btn-clear">
                    <i class="fas fa-trash-alt"></i> Clear
                </button>
                <button class="btn-compare">
                    <i class="fas fa-exchange-alt"></i> Compare
                </button>
            </div>
        `;
        document.body.appendChild(comparisonSidebar);

        // Create trigger button
        const comparisonTrigger = document.createElement('button');
        comparisonTrigger.className = 'comparison-trigger';
        comparisonTrigger.innerHTML = `
            <i class="fas fa-exchange-alt comparison-trigger-icon"></i>
            <span class="comparison-trigger-count">0</span>
        `;
        comparisonTrigger.style.display = 'none';
        document.body.appendChild(comparisonTrigger);

        // Add event listeners
        comparisonTrigger.addEventListener('click', toggleSidebar);
        comparisonSidebar.querySelector('.comparison-sidebar-close').addEventListener('click', toggleSidebar);
        comparisonOverlay.addEventListener('click', toggleSidebar);
        comparisonSidebar.querySelector('.btn-clear').addEventListener('click', clearComparison);
        comparisonSidebar.querySelector('.btn-add-all').addEventListener('click', function (){
            addAllTanks();
        });
        comparisonSidebar.querySelector('.btn-compare').addEventListener('click', function() {
            if (comparisonData.length > 0) {
                window.location.href = 'check-compare';
            }
        });

        // Initialize sidebar with current data
        updateComparisonSidebar();
    }

    // Toggle sidebar visibility
    function toggleSidebar(event) {
        const sidebar = document.querySelector('.comparison-sidebar');
        const overlay = document.querySelector('.comparison-overlay');
        const trigger = document.querySelector('.comparison-trigger');

        // If click came from outside the sidebar and overlay, and sidebar is open, close it
        if (event && event.target !== overlay && !sidebar.contains(event.target) &&
            !trigger.contains(event.target) && sidebar.classList.contains('open')) {
            // This is a click outside, so we'll close the sidebar
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
            trigger.style.right = '0';
            return;
        }

        // Normal toggle behavior
        const isOpening = !sidebar.classList.contains('open');

        sidebar.classList.toggle('open');
        overlay.style.display = isOpening ? 'block' : 'none';

        // Position the trigger button at the edge of the sidebar
        if (isOpening) {
            trigger.style.right = `${sidebar.offsetWidth}px`;
            trigger.style.display = 'flex';
            trigger.classList.remove('pop-animation');
        } else {
            trigger.style.right = '0';
        }
    }

    // Update comparison sidebar display
    function updateComparisonSidebar() {
        const sidebar = document.querySelector('.comparison-sidebar');
        const trigger = document.querySelector('.comparison-trigger');
        const tanksList = sidebar ? sidebar.querySelector('.comparison-tanks-list') : null;
        const triggerCount = trigger ? trigger.querySelector('.comparison-trigger-count') : null;

        if (!tanksList || !triggerCount) return;

        tanksList.innerHTML = '';

        if (comparisonData.length === 0) {
            tanksList.innerHTML = `
                <div class="comparison-empty">
                    No tanks selected for comparison,<br>
                    add two or more tanks to start the comparison</a>
                </div>
            `;
            // Show trigger button even when empty
            trigger.style.display = 'flex';
            triggerCount.textContent = '0';
            return;
        }

        // Create tank elements for the sidebar
        comparisonData.forEach(tankId => {
            const tankCard = document.querySelector(`.tank-card[data-tank-id="${tankId}"]`);
            if (tankCard) {
                const tankName = tankCard.querySelector('h3').textContent;
                const tankImg = tankCard.querySelector('.tank-img').src;

                const tankElement = document.createElement('div');
                tankElement.className = 'comparison-tank-item';
                tankElement.innerHTML = `
                    <img src="${tankImg}" alt="${tankName}" class="comparison-tank-img" onerror="this.src='https://cdn5.heatlabs.net/placeholder/imagefailedtoload.webp'">
                    <span class="comparison-tank-name">${tankName}</span>
                    <button class="comparison-tank-remove" data-tank-id="${tankId}">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                tanksList.appendChild(tankElement);

                tankElement.querySelector('.comparison-tank-remove').addEventListener('click', function(e) {
                    e.stopPropagation();
                    removeTankFromComparison(tankId);
                });
            }
        });

        triggerCount.textContent = comparisonData.length;
        trigger.style.display = 'flex';

        // Position the trigger button at the edge of the sidebar if it's open
        if (sidebar.classList.contains('open')) {
            trigger.style.right = `${sidebar.offsetWidth}px`;
        } else {
            trigger.style.right = '0';
        }
    }

    // Fetch tank data from JSON file
    async function fetchTankData() {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json');
            if (!response.ok) {
                throw new Error('Failed to load tank data');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading tank data:', error);
            return []; // Return empty array if there's an error
        }
    }

    async function fetchViewCount(imageName) {
        try {
            const response = await fetch(`https://views.heatlabs.net/api/stats?image=pcwstats-tracker-pixel-${imageName}.png`);
            if (!response.ok) {
                throw new Error('Failed to load view count');
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading view count:', error);
            return {
                totalViews: 0
            }; // Return 0 if there's an error
        }
    }

    // Function to update view counters on all tank cards
    async function updateTankViewCounters() {
        const tankCards = document.querySelectorAll('.tank-card');

        for (const card of tankCards) {
            const tankLink = card.querySelector('a.btn-accent');
            if (tankLink) {
                // Extract the tank name from the href (e.g., "tanks/t-72.html" -> "t-72")
                const tankName = tankLink.getAttribute('href').split('/').pop().replace('.html', '');

                // Fetch the view count
                const viewsData = await fetchViewCount(tankName);
                const viewsElement = card.querySelector('.views-count');

                if (viewsElement) {
                    viewsElement.textContent = viewsData.totalViews.toLocaleString();
                }
            }
        }
    }

    // Create tank card HTML
    function createTankCard(tank) {
        const card = document.createElement('div');
        card.className = 'tank-card';
        card.setAttribute('data-nation', tank.nation);
        card.setAttribute('data-type', tank.type);
        card.setAttribute('data-status', tank.class);
        card.setAttribute('data-tank-id', tank.id);

        // Only show tank class (bubble) if it exists and isn't empty
        const tankClassHTML = tank.class && tank.class.trim() !== '' ?
            `<div class="tank-class">${tank.class}</div>` : '';

        card.innerHTML = `
            <div class="tank-img-container">
                <div class="tank-views-counter">
                    <i class="fas fa-eye"></i>
                    <span class="views-count">0</span>
                </div>
                <img src="${tank.image}" alt="${tank.name} Preview" class="tank-img" onerror="this.src='https://cdn5.heatlabs.net/placeholder/imagefailedtoload.webp'">
                ${tankClassHTML}
            </div>
            <div class="tank-info">
                <h3>${tank.name}</h3>
                <div class="tank-meta">
                    <span><i class="fas fa-flag"></i> ${tank.nation}</span>
                    <span><i class="fas fa-layer-group"></i> ${tank.type}</span>
                </div>
                <div class="tank-buttons">
                    <a href="tanks/${tank.slug}" class="btn-accent">
                        <i class="fas fa-chart-bar mr-2"></i>Statistics
                    </a>
                    <button class="btn-outline compare-btn" data-tank-id="${tank.id}">
                        <i class="fas fa-exchange-alt mr-2"></i>Compare
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    // Animate tank cards into view
    function animateTankCards() {
        tankCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animated');
            }, index * 100); // Stagger the animations
        });
    }

    // Render all tank cards
    async function renderTankCards() {
        const tanks = await fetchTankData();
        tanksGrid.innerHTML = ''; // Clear existing cards

        if (!tanks || tanks.length === 0) {
            tanksGrid.innerHTML = '<p class="text-center py-10">Failed to load tank data. Please try again later.</p>';
            return;
        }

        // Create and append cards for each tank
        tanks.forEach(tank => {
            const card = createTankCard(tank);
            tanksGrid.appendChild(card);
        });

        // Store references to all tank cards
        tankCards = Array.from(document.querySelectorAll('.tank-card'));

        // Animate the cards into view
        animateTankCards();

        // Initialize filter functionality
        initFilterButtons();

        // Update view counters
        updateTankViewCounters();

        // Initialize comparison buttons
        initComparisonButtons();

        // Update sidebar after tanks are loaded
        updateComparisonSidebar();
    }

    // Initialize filter buttons
    function initFilterButtons() {
        // Nation filter buttons
        document.querySelectorAll('.nation-filter').forEach(button => {
            button.addEventListener('click', function() {
                const nation = this.getAttribute('data-nation');
                toggleFilter('nation', nation, this);
                filterTanks();
            });
        });

        // Status filter buttons
        document.querySelectorAll('.status-filter').forEach(button => {
            button.addEventListener('click', function() {
                const status = this.getAttribute('data-status');
                toggleFilter('status', status, this);
                filterTanks();
            });
        });

        // Type filter buttons
        document.querySelectorAll('.type-filter').forEach(button => {
            button.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                toggleFilter('type', type, this);
                filterTanks();
            });
        });

        // Initialize active filters display
        updateActiveFilters();
    }

    // Initialize comparison buttons
    function initComparisonButtons() {
        document.querySelectorAll('.compare-btn').forEach(button => {
            button.addEventListener('click', function() {
                const tankId = this.getAttribute('data-tank-id');
                addTankToComparison(tankId);
            });
        });
    }

    // Toggle filter on/off
    function toggleFilter(filterType, value, button) {
        const index = filters[filterType].indexOf(value);

        if (index === -1) {
            filters[filterType].push(value);
            button.classList.add('active');
        } else {
            filters[filterType].splice(index, 1);
            button.classList.remove('active');
        }

        updateActiveFilters();
    }

    // Update active filters display
    function updateActiveFilters() {
        activeFiltersContainer.innerHTML = '';

        // Check if any filters are active
        const hasFilters = filters.nation.length > 0 || filters.type.length > 0 || filters.status.length > 0;

        if (!hasFilters) {
            activeFiltersContainer.innerHTML = '<div class="no-filters-message">No filters selected</div>';
            return;
        }

        // Add nation filters
        filters.nation.forEach(nation => {
            const pill = createFilterPill(nation, 'nation');
            activeFiltersContainer.appendChild(pill);
        });

        // Add type filters
        filters.type.forEach(type => {
            const pill = createFilterPill(type, 'type');
            activeFiltersContainer.appendChild(pill);
        });

        // Add status filters
        filters.status.forEach(status => {
            const pill = createFilterPill(status, 'status');
            activeFiltersContainer.appendChild(pill);
        });
    }

    // Create filter pill element
    function createFilterPill(value, filterType) {
        const pill = document.createElement('div');
        pill.className = 'filter-pill';
        pill.innerHTML = `
            ${value}
            <button class="remove-filter" data-filter-type="${filterType}" data-value="${value}">
                <i class="fas fa-times"></i>
            </button>
        `;

        pill.querySelector('.remove-filter').addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter-type');
            const value = this.getAttribute('data-value');

            // Remove from filters
            const index = filters[filterType].indexOf(value);
            if (index !== -1) {
                filters[filterType].splice(index, 1);
            }

            // Update corresponding filter button
            const button = document.querySelector(`.${filterType}-filter[data-${filterType}="${value}"]`);
            if (button) button.classList.remove('active');

            updateActiveFilters();
            filterTanks();
        });

        return pill;
    }

    // Filter tanks based on active filters
    function filterTanks() {
        if (tankCards.length === 0) return;

        tankCards.forEach(card => {
            const cardNation = card.getAttribute('data-nation');
            const cardType = card.getAttribute('data-type');
            const cardStatus = card.querySelector('.tank-class') ?
                card.querySelector('.tank-class').textContent : 'Unknown';

            const nationMatch = filters.nation.length === 0 || filters.nation.includes(cardNation);
            const typeMatch = filters.type.length === 0 || filters.type.includes(cardType);
            const statusMatch = filters.status.length === 0 || filters.status.includes(cardStatus);

            if (nationMatch && typeMatch && statusMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Update the comparison modal display
    function updateComparisonModal() {
        if (!comparisonTanksContainer) return;

        comparisonTanksContainer.innerHTML = '';

        comparisonData.forEach(tankId => {
            const tankCard = document.querySelector(`.tank-card[data-tank-id="${tankId}"]`);
            if (tankCard) {
                const tankName = tankCard.querySelector('h3').textContent;
                const tankImg = tankCard.querySelector('.tank-img').src;

                const tankElement = document.createElement('div');
                tankElement.className = 'comparison-tank';
                tankElement.innerHTML = `
                    <img src="${tankImg}" alt="${tankName}">
                    <span>${tankName}</span>
                    <button class="remove-tank" data-tank-id="${tankId}">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                comparisonTanksContainer.appendChild(tankElement);

                tankElement.querySelector('.remove-tank').addEventListener('click', function(e) {
                    e.stopPropagation();
                    removeTankFromComparison(tankId);
                });
            }
        });

        if (comparisonCount) {
            comparisonCount.textContent = comparisonData.length;
        }

        if (comparisonModal) {
            comparisonModal.style.display = comparisonData.length > 0 ? 'flex' : 'none';
        }
    }

    function triggerPopAnimation() {
        const trigger = document.querySelector('.comparison-trigger');
        if (trigger) {
            // Remove any existing animation class
            trigger.classList.remove('pop-animation');

            // Trigger reflow to restart animation
            void trigger.offsetWidth;

            // Add animation class
            trigger.classList.add('pop-animation');

            // Remove the class after animation completes
            setTimeout(() => {
                trigger.classList.remove('pop-animation');
            }, 200);
        }
    }

    // Add tank to comparison
    function addTankToComparison(tankId) {
        if (!comparisonData.includes(tankId)) {
            comparisonData.push(tankId);
            saveComparisonData();
            if (comparisonData.length === 1) {
                initComparisonSidebar();
            }
            triggerPopAnimation();
        }
    }

    // Remove tank from comparison
    function removeTankFromComparison(tankId) {
        comparisonData = comparisonData.filter(id => id !== tankId);
        saveComparisonData();
    }

    // Clear all tanks from comparison
    function clearComparison() {
        comparisonData = [];
        saveComparisonData();
        updateComparisonSidebar();
    }

    // Add all tanks to comparison
    function addAllTanks() {
        // Get all tank cards that are currently visible (after filtering)
        const visibleTankCards = Array.from(document.querySelectorAll('.tank-card[data-tank-id]'))
            .filter(card => card.style.display !== 'none');

        // Get their IDs
        const allTankIds = visibleTankCards.map(card => card.getAttribute('data-tank-id'));

        // Add all tanks that aren't already in comparison
        allTankIds.forEach(tankId => {
            if (!comparisonData.includes(tankId)) {
                comparisonData.push(tankId);
            }
        });

        // Save and update UI
        saveComparisonData();

        // Trigger animation
        triggerPopAnimation();
    }

    // Save comparison data to localStorage
    function saveComparisonData() {
        localStorage.setItem('tankComparison', JSON.stringify(comparisonData));
        updateComparisonModal();
        updateComparisonSidebar();
    }

    // Initialize the page
    renderTankCards();
    initComparisonSidebar();
    updateComparisonModal();

    // Event delegation for compare buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.compare-btn')) {
            const tankId = e.target.closest('.compare-btn').getAttribute('data-tank-id');
            addTankToComparison(tankId);
            triggerPopAnimation();
        }
    });

    // Event listeners for comparison modal buttons
    if (clearComparisonBtn) {
        clearComparisonBtn.addEventListener('click', clearComparison);
    }
    if (openComparisonBtn) {
        openComparisonBtn.addEventListener('click', function() {
            if (comparisonData.length > 0) {
                window.location.href = 'check-compare';
            }
        });
    }
});