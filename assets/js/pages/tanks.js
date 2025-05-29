document.addEventListener('DOMContentLoaded', function() {
    // Initialize filters
    const filters = {
        nation: [],
        type: []
    };

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
    let comparisonData = [];

    // Fetch tank data from JSON file
    async function fetchTankData() {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/gh/PCWStats/Website-Configs@main/tanks.json');
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

    // Create tank card HTML
    function createTankCard(tank) {
        const card = document.createElement('div');
        card.className = 'tank-card';
        card.setAttribute('data-nation', tank.nation);
        card.setAttribute('data-type', tank.type);
        card.setAttribute('data-tank-id', tank.id);

        // Only show tank class (bubble) if it exists and isn't empty
        const tankClassHTML = tank.class && tank.class.trim() !== '' ?
            `<div class="tank-class">${tank.class}</div>` : '';

        card.innerHTML = `
            <div class="tank-img-container">
                <img src="${tank.image}" alt="${tank.name} Preview" class="tank-img" onerror="this.src='https://raw.githubusercontent.com/PCWStats/Website-Images/main/placeholder/imagefailedtoload.png'">
                ${tankClassHTML}
            </div>
            <div class="tank-info">
                <h3>${tank.name}</h3>
                <div class="tank-meta">
                    <span><i class="fas fa-flag"></i> ${tank.nation}</span>
                    <span><i class="fas fa-layer-group"></i> ${tank.type}</span>
                </div>
                <div class="tank-buttons">
                    <a href="tanks/${tank.slug}.html" class="btn-accent">
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
        const hasFilters = filters.nation.length > 0 || filters.type.length > 0;

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

            const nationMatch = filters.nation.length === 0 || filters.nation.includes(cardNation);
            const typeMatch = filters.type.length === 0 || filters.type.includes(cardType);

            if (nationMatch && typeMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Load comparison data from localStorage
    function loadComparisonData() {
        const savedComparison = localStorage.getItem('tankComparison');
        if (savedComparison) {
            comparisonData = JSON.parse(savedComparison);
            updateComparisonModal();
        }
    }

    // Save comparison data to localStorage
    function saveComparisonData() {
        localStorage.setItem('tankComparison', JSON.stringify(comparisonData));
        updateComparisonModal();
    }

    // Update the comparison modal display
    function updateComparisonModal() {
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

        comparisonCount.textContent = comparisonData.length;

        if (comparisonData.length > 0) {
            comparisonModal.style.display = 'flex';
        } else {
            comparisonModal.style.display = 'none';
        }
    }

    // Add tank to comparison
    function addTankToComparison(tankId) {
        if (!comparisonData.includes(tankId)) {
            comparisonData.push(tankId);
            saveComparisonData();
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
    }

    // Initialize the page
    renderTankCards();
    loadComparisonData();

    // Event delegation for compare buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.compare-btn')) {
            const tankId = e.target.closest('.compare-btn').getAttribute('data-tank-id');
            addTankToComparison(tankId);
        }
    });

    // Event listeners for comparison modal buttons
    clearComparisonBtn.addEventListener('click', clearComparison);
    openComparisonBtn.addEventListener('click', function() {
        if (comparisonData.length > 0) {
            window.location.href = 'check-compare.html';
        }
    });
});