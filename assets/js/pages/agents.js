document.addEventListener('DOMContentLoaded', function() {
    // Initialize filters
    const filters = {
        status: []
    };

    // DOM elements
    const activeFiltersContainer = document.querySelector('.active-filters');
    const noFiltersMessage = document.querySelector('.no-filters-message');
    const agentsGrid = document.querySelector('.agents-grid');
    let agentCards = []; // Will store references to all agent cards

    // Fetch agent data from JSON file
    async function fetchAgentData() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/HEATLabs/HEAT-Labs-Configs/refs/heads/main/agents.json');
            if (!response.ok) {
                throw new Error('Failed to load agent data');
            }
            const data = await response.json();
            return data.agents; // Return the agents array from the JSON
        } catch (error) {
            console.error('Error loading agent data:', error);
            return []; // Return empty array if there's an error
        }
    }

    // Fetch view count for an agent
    async function fetchViewCount(agentSlug) {
        try {
            const response = await fetch(`https://views.heatlabs.net/api/stats?image=pcwstats-tracker-pixel-${agentSlug}.png`);
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

    // Update view counters on all agent cards
    async function updateAgentViewCounters() {
        const agentCards = document.querySelectorAll('.agent-card');

        for (const card of agentCards) {
            const agentLink = card.querySelector('a.btn-accent');
            if (agentLink) {
                // Extract the agent slug from the href (e.g., "agents/john-doe.html" -> "john-doe")
                const agentSlug = agentLink.getAttribute('href').split('/').pop().replace('.html', '');

                // Fetch the view count
                const viewsData = await fetchViewCount(agentSlug);
                const viewsElement = card.querySelector('.views-count');

                if (viewsElement) {
                    viewsElement.textContent = viewsData.totalViews.toLocaleString();
                }
            }
        }
    }

    // Create agent card HTML
    function createAgentCard(agent) {
        const card = document.createElement('div');
        card.className = 'agent-card';
        card.setAttribute('data-status', agent.status);
        card.setAttribute('data-agent-id', agent.id);

        // Get number of compatible tanks
        const tankCount = agent.compatibleTanks ? agent.compatibleTanks.length : 0;
        const tankText = tankCount === 1 ? '1 Vehicle' : `${tankCount} Vehicles`;

        // Only show agent status (bubble) if it exists and isn't empty
        const agentStatusHTML = agent.status && agent.status.trim() !== '' ?
            `<div class="agent-status">${agent.status}</div>` : '';

        card.innerHTML = `
            <div class="agent-img-container">
                <div class="agent-views-counter">
                    <i class="fas fa-eye"></i>
                    <span class="views-count">0</span>
                </div>
                <img src="${agent.image}" alt="${agent.name} Preview" class="agent-img" onerror="this.src='https://cdn5.heatlabs.net/placeholder/imagefailedtoload.webp'">
                ${agentStatusHTML}
            </div>
            <div class="agent-info">
                <h3>${agent.name}</h3>
                <div class="agent-meta">
                    <span><i class="fa-solid fa-bolt"></i> ${agent.specialty}</span>
                    <span><i class="fa-solid fa-gear"></i> ${tankText}</span>
                </div>
                <div class="agent-buttons">
                    <a href="agents/${agent.slug}" class="btn-accent">
                        <i class="fas fa-info-circle mr-2"></i>Details
                    </a>
                </div>
            </div>
        `;

        return card;
    }

    // Animate agent cards into view
    function animateAgentCards() {
        agentCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animated');
            }, index * 100); // Stagger the animations
        });
    }

    // Render all agent cards
    async function renderAgentCards() {
        const agents = await fetchAgentData();
        agentsGrid.innerHTML = ''; // Clear existing cards

        if (!agents || agents.length === 0) {
            agentsGrid.innerHTML = '<p class="text-center py-10">Failed to load agent data. Please try again later.</p>';
            return;
        }

        // Create and append cards for each agent
        agents.forEach(agent => {
            const card = createAgentCard(agent);
            agentsGrid.appendChild(card);
        });

        // Store references to all agent cards
        agentCards = Array.from(document.querySelectorAll('.agent-card'));

        // Animate the cards into view
        animateAgentCards();

        // Initialize filter functionality
        initFilterButtons();

        // Update view counters
        updateAgentViewCounters();
    }

    // Initialize filter buttons
    function initFilterButtons() {
        // Status filter buttons
        document.querySelectorAll('.status-filter').forEach(button => {
            button.addEventListener('click', function() {
                const status = this.getAttribute('data-status');
                toggleFilter('status', status, this);
            });
        });

        // Initialize active filters display
        updateActiveFilters();
    }

    // Toggle filter on/off - now only allows one status filter at a time
    function toggleFilter(filterType, value, button) {
        const isAlreadyActive = filters[filterType].includes(value);

        if (isAlreadyActive) {
            // If clicking the active filter, remove it
            filters[filterType] = [];
            button.classList.remove('active');
        } else {
            // Otherwise, set this as the only active filter
            filters[filterType] = [value];

            // Update all filter buttons of this type
            document.querySelectorAll(`.${filterType}-filter`).forEach(btn => {
                btn.classList.remove('active');
            });

            // Activate the clicked button
            button.classList.add('active');
        }

        updateActiveFilters();
        filterAgents();
    }

    // Update active filters display
    function updateActiveFilters() {
        activeFiltersContainer.innerHTML = '';

        // Check if any filters are active
        const hasFilters = filters.status.length > 0;

        if (!hasFilters) {
            activeFiltersContainer.innerHTML = '<div class="no-filters-message">No filters selected</div>';
            return;
        }

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
            filterAgents();
        });

        return pill;
    }

    // Filter agents based on active filters
    function filterAgents() {
        if (agentCards.length === 0) return;

        agentCards.forEach(card => {
            const cardStatus = card.getAttribute('data-status');
            const statusMatch = filters.status.length === 0 || filters.status.includes(cardStatus);

            if (statusMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Initialize the page
    renderAgentCards();
});