document.addEventListener('DOMContentLoaded', function() {
    // Initialize filters
    const filters = {
        nation: [],
        type: []
    };

    // DOM elements
    const activeFiltersContainer = document.querySelector('.active-filters');
    const noFiltersMessage = document.querySelector('.no-filters-message');
    const tankCards = document.querySelectorAll('.tank-card');

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

    // Initialize
    initFilterButtons();
});