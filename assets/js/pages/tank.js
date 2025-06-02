// Initialize charts
let firepowerChart, survivabilityChart, mobilityChart, utilityChart;
let allTanksData = [];
let currentTankId = null;
let currentTankType = 'Unknown';
let currentTankAgents = [];
let chartDatasets = {
    firepower: [],
    survivability: [],
    mobility: [],
    utility: []
};

let activeStatIndex = {
    firepower: 0,
    survivability: 0,
    mobility: 0,
    utility: 0
};

// Tank Page JS for PCWStats
document.addEventListener('DOMContentLoaded', function() {
    // Get tank ID from meta tag
    const tankIdMeta = document.querySelector('meta[name="tank-id"]');
    const tankId = tankIdMeta ? tankIdMeta.content : null;

    // Fetch and display view count
    fetchViewCount().then(views => {
        displayViewCounter(views);
    });

    // If tank ID is specified, fetch and populate tank data
    if (tankId) {
        fetchTankData(tankId);
    }

    // Initialize gamemode selector functionality
    const gamemodeButtons = document.querySelectorAll('.gamemode-btn');
    const gamemodeSections = document.querySelectorAll('.gamemode-section');

    // Set up click handlers for gamemode buttons
    gamemodeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            gamemodeButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Get the gamemode to show
            const gamemode = this.dataset.gamemode;

            // Hide all gamemode sections
            gamemodeSections.forEach(section => {
                section.classList.remove('active');
            });

            // Show the selected gamemode section
            document.getElementById(gamemode).classList.add('active');

            // Update URL hash if needed
            window.location.hash = gamemode;
        });
    });

    // Check for hash on page load to set initial gamemode
    if (window.location.hash) {
        const initialGamemode = window.location.hash.substring(1);
        const initialButton = document.querySelector(`.gamemode-btn[data-gamemode="${initialGamemode}"]`);

        if (initialButton) {
            initialButton.click();
        }
    }

    // Initialize agent modals
    initializeAgentModals();

    // Initialize any interactive elements specific to tank pages
    initializeTankPageElements();

    // Initialize charts
    initializeCharts();
});

// Chart.js configuration
const chartColors = [
    'rgba(255, 99, 132, 0.7)', // Red
    'rgba(54, 162, 235, 0.7)', // Blue
    'rgba(255, 206, 86, 0.7)', // Yellow
    'rgba(75, 192, 192, 0.7)', // Teal
    'rgba(153, 102, 255, 0.7)', // Purple
    'rgba(255, 159, 64, 0.7)', // Orange
    'rgba(100, 200, 100, 0.7)', // Green
    'rgba(200, 100, 200, 0.7)', // Pink
    'rgba(100, 100, 255, 0.7)', // Light Blue
    'rgba(255, 100, 100, 0.7)' // Light Red
];

const chartBorderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(100, 200, 100, 1)',
    'rgba(200, 100, 200, 1)',
    'rgba(100, 100, 255, 1)',
    'rgba(255, 100, 100, 1)'
];

// Chart configuration
const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            callbacks: {
                label: function(context) {
                    return `${context.dataset.label}: ${context.raw}`;
                }
            }
        },
        title: {
            display: false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(200, 200, 200, 0.1)'
            },
            stacked: false
        },
        x: {
            grid: {
                color: 'rgba(200, 200, 200, 0.1)'
            },
            stacked: false
        }
    }
};

// Super mega ultra aggressive overrides for chart theme colors
function updateChartColors() {
    if (firepowerChart) {
        firepowerChart.options.scales.x.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        firepowerChart.options.scales.y.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        firepowerChart.update();
    }
    if (survivabilityChart) {
        survivabilityChart.options.scales.x.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        survivabilityChart.options.scales.y.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        survivabilityChart.update();
    }
    if (mobilityChart) {
        mobilityChart.options.scales.x.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        mobilityChart.options.scales.y.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        mobilityChart.update();
    }
    if (utilityChart) {
        utilityChart.options.scales.x.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        utilityChart.options.scales.y.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        utilityChart.update();
    }

    // Force redraw
    document.body.classList.add('chart-theme-updated');
    setTimeout(() => document.body.classList.remove('chart-theme-updated'), 100);
}

async function fetchViewCount() {
    try {
        // Get the tracking pixel URL from the meta tag
        const trackingPixel = document.querySelector('.pcwstats-tracking-pixel');
        if (!trackingPixel || !trackingPixel.src) {
            return {
                totalViews: 0
            };
        }

        // Extract the image filename from the tracking pixel URL
        const imageName = trackingPixel.src.split('/').pop();

        // Build the stats API URL
        const statsApiUrl = `https://pcwstats-pixel-api.vercel.app/api/stats?image=${imageName}`;
        const response = await fetch(statsApiUrl);

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

// Function to display view counter in the tank header
function displayViewCounter(views) {
    const tankMeta = document.querySelector('.tank-meta');
    if (tankMeta) {
        // Check if view counter already exists
        if (!tankMeta.querySelector('.map-views-counter')) {
            const viewCounter = document.createElement('span');
            viewCounter.className = 'map-views-counter';
            viewCounter.innerHTML = `
                <i class="fas fa-eye"></i>
                <span class="map-views-count">${views.totalViews.toLocaleString()}</span> views
            `;
            tankMeta.appendChild(viewCounter);
        }
    }
}

function isValidTankStats(stats) {
    if (!stats) return false;

    // Check each category for non-zero values
    const categories = ['FIREPOWER', 'MOBILITY', 'SURVIVABILITY', 'RECON', 'UTILITY'];
    return categories.some(category => {
        if (!stats[category]) return false;
        return Object.values(stats[category]).some(val => {
            const num = parseFloat(val);
            // Also check for negative values (like gun depression which shows as "-0")
            return !isNaN(num) && num !== 0;
        });
    });
}

async function initializeCharts() {
    // Get tank ID from meta tag
    const tankIdMeta = document.querySelector('meta[name="tank-id"]');
    currentTankId = tankIdMeta ? tankIdMeta.content : null;

    if (!currentTankId) {
        showNoDataMessage();
        return;
    }

    try {
        // First fetch the tanks.json to get the tank details
        const tanksResponse = await fetch('https://cdn.jsdelivr.net/gh/PCWStats/Website-Configs@main/tanks.json');
        const tanksData = await tanksResponse.json();

        // Find current tank to get type and agents
        const currentTank = tanksData.find(t => t.id.toString() === currentTankId.toString());
        if (currentTank) {
            currentTankType = currentTank.type || 'Unknown';
            currentTankAgents = [];

            // Get agents for this tank if available
            if (currentTank.agents) {
                try {
                    const agentsResponse = await fetch(currentTank.agents);
                    const agentsData = await agentsResponse.json();
                    if (agentsData && agentsData.agents) {
                        currentTankAgents = agentsData.agents.map(a => a.name);
                    }
                } catch (error) {
                    console.error('Error fetching agents:', error);
                }
            }
        }

        // Fetch all stock data for comparison
        const stockPromises = tanksData.map(async tank => {
            try {
                const response = await fetch(tank.stock);
                const data = await response.json();

                // Try different ways to get the stats for this tank
                const tankStats = data[tank.id] || data[tank.slug] || Object.values(data)[0];

                if (tankStats && isValidTankStats(tankStats)) {
                    return {
                        id: tank.id,
                        name: tank.name,
                        type: tank.type || 'Unknown',
                        stats: tankStats,
                        agentsUrl: tank.agents
                    };
                }
            } catch (error) {
                console.error(`Error fetching stock data for tank ${tank.id}:`, error);
                return null;
            }
            return null;
        });

        const stockData = await Promise.all(stockPromises);
        allTanksData = stockData.filter(tank => tank !== null);

        // Check if current tank has valid stats - CRITICAL FIX HERE
        const currentTankData = allTanksData.find(tank =>
            tank && tank.id && tank.id.toString() === currentTankId.toString()
        );

        // If current tank doesn't exist in valid data or has no valid stats, show no data message
        if (!currentTankData) {
            showNoDataMessage();
            return;
        }

        // Initialize chart filter buttons
        setupChartFilters();

        // Create initial charts (compare with all tanks)
        updateCharts('all');

    } catch (error) {
        console.error('Error initializing charts:', error);
        showNoDataMessage();
    }
}

function setupChartFilters() {
    const filterButtons = document.querySelectorAll('.chart-filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Get the comparison type
            const compareType = this.dataset.compareType;

            // Update charts
            updateCharts(compareType).then(() => {
                // Ensure colors are updated after charts are rendered
                setTimeout(updateChartColors, 1);
            });
        });
    });

    // Initialize stat toggle buttons
    initializeStatToggles();
}

async function updateCharts(compareType) {
    if (!allTanksData.length || !currentTankId) {
        showNoDataMessage();
        return;
    }

    // Find current tank data
    const currentTank = allTanksData.find(tank =>
        tank && tank.id && tank.id.toString() === currentTankId.toString()
    );

    // If current tank has invalid stats or doesn't exist, show no data message
    if (!currentTank || !currentTank.stats || !isValidTankStats(currentTank.stats)) {
        showNoDataMessage();
        return;
    }

    // Filter tanks based on comparison type
    let tanksToCompare = [];

    switch (compareType) {
        case 'agent':
            // Compare with tanks that share at least one agent
            if (currentTankAgents.length > 0) {
                // First get all tanks that share any agent with current tank
                const agentTankPromises = allTanksData.map(async tank => {
                    if (!tank.agentsUrl || tank.id.toString() === currentTankId.toString()) {
                        return null;
                    }

                    try {
                        const response = await fetch(tank.agentsUrl);
                        const agentsData = await response.json();
                        if (agentsData && agentsData.agents) {
                            const sharedAgents = agentsData.agents.filter(agent =>
                                currentTankAgents.includes(agent.name)
                            );
                            return sharedAgents.length > 0 ? tank : null;
                        }
                    } catch (error) {
                        console.error(`Error fetching agents for tank ${tank.id}:`, error);
                        return null;
                    }
                    return null;
                });

                const agentTanks = await Promise.all(agentTankPromises);
                tanksToCompare = agentTanks.filter(tank => tank !== null);
            } else {
                // Fallback to all tanks if no agent data
                tanksToCompare = allTanksData.filter(tank =>
                    tank && tank.id && tank.id.toString() !== currentTankId.toString()
                );
            }
            break;
        case 'type':
            // Compare with tanks of the same type
            if (currentTankType !== 'Unknown') {
                tanksToCompare = allTanksData.filter(tank =>
                    tank && tank.type === currentTankType && tank.id.toString() !== currentTankId.toString()
                );
            } else {
                tanksToCompare = allTanksData.filter(tank =>
                    tank && tank.id && tank.id.toString() !== currentTankId.toString()
                );
            }
            break;
        default:
            // Compare with all tanks except current
            tanksToCompare = allTanksData.filter(tank =>
                tank && tank.id && tank.id.toString() !== currentTankId.toString()
            );
    }

    // Filter out tanks with invalid stats
    tanksToCompare = tanksToCompare.filter(tank =>
        tank && tank.stats && isValidTankStats(tank.stats)
    );

    // Limit to top 49 tanks plus current tank for better visualization
    tanksToCompare = tanksToCompare.slice(0, 49);

    // Create an array of all tank objects
    const allTanksForCharts = [currentTank, ...tanksToCompare];

    // Store the original order of tanks with their names and IDs
    const originalTankOrder = allTanksForCharts.map(tank => ({
        id: tank.id,
        name: tank.name,
        type: tank.type
    }));

    // Store this order for later use in chart updates
    if (!window.chartData) {
        window.chartData = {};
    }
    window.chartData[compareType] = {
        originalOrder: originalTankOrder,
        tanks: allTanksForCharts
    };

    // Prepare data for charts
    const labels = allTanksForCharts.map(tank => tank ? tank.name : 'Unknown');

    // Firepower data
    const firepowerDamage = allTanksForCharts.map(tank => {
        if (!tank || !tank.stats || !tank.stats.FIREPOWER) return 0;
        return parseFloat(tank.stats.FIREPOWER.DAMAGE) || 0;
    });
    const firepowerReload = allTanksForCharts.map(tank => {
        if (!tank || !tank.stats || !tank.stats.FIREPOWER) return 0;
        return parseFloat(tank.stats.FIREPOWER["RELOAD TIME"]) || 0;
    });
    const firepowerAiming = allTanksForCharts.map(tank => {
        if (!tank || !tank.stats || !tank.stats.FIREPOWER) return 0;
        return parseFloat(tank.stats.FIREPOWER["AIMING SPEED"]) || 0;
    });

    // Survivability data
    const survivabilityHp = allTanksForCharts.map(tank => {
        if (!tank || !tank.stats || !tank.stats.SURVIVABILITY) return 0;
        return parseFloat(tank.stats.SURVIVABILITY["HIT POINTS"]) || 0;
    });
    const survivabilityCrewHp = allTanksForCharts.map(tank => {
        if (!tank || !tank.stats || !tank.stats.SURVIVABILITY) return 0;
        return parseFloat(tank.stats.SURVIVABILITY["CREW HIT POINTS"]) || 0;
    });
    const survivabilityTrackHp = allTanksForCharts.map(tank => {
        if (!tank || !tank.stats || !tank.stats.SURVIVABILITY) return 0;
        return parseFloat(tank.stats.SURVIVABILITY["TRACK HIT POINTS"]) || 0;
    });

    // Mobility data
    const mobilityForward = allTanksForCharts.map(tank => {
        if (!tank || !tank.stats || !tank.stats.MOBILITY) return 0;
        return parseFloat(tank.stats.MOBILITY["FORWARD SPEED, KM/H"]) || 0;
    });
    const mobilityReverse = allTanksForCharts.map(tank => {
        if (!tank || !tank.stats || !tank.stats.MOBILITY) return 0;
        return parseFloat(tank.stats.MOBILITY["REVERSE SPEED, KM/H"]) || 0;
    });
    const mobilityTraverse = allTanksForCharts.map(tank => {
        if (!tank || !tank.stats || !tank.stats.MOBILITY) return 0;
        return parseFloat(tank.stats.MOBILITY["TRAVERSE SPEED"]) || 0;
    });

    // Utility data
    const utilityEnergy = allTanksForCharts.map(tank => {
        if (!tank || !tank.stats || !tank.stats.UTILITY) return 0;
        return parseFloat(tank.stats.UTILITY["ENERGY POINTS"]) || 0;
    });
    const utilityRegen = allTanksForCharts.map(tank => {
        if (!tank || !tank.stats || !tank.stats.UTILITY) return 0;
        return parseFloat(tank.stats.UTILITY["ENERGY REGENERATION"]) || 0;
    });
    const utilitySpotting = allTanksForCharts.map(tank => {
        if (!tank || !tank.stats || !tank.stats.RECON) return 0;
        return parseFloat(tank.stats.RECON["SPOTTING RANGE, METERS"]) || 0;
    });

    // Store datasets for each chart
    chartDatasets.firepower = [{
            label: 'Damage',
            data: firepowerDamage,
            tankOrder: originalTankOrder
        },
        {
            label: 'Reload Time',
            data: firepowerReload,
            tankOrder: originalTankOrder
        },
        {
            label: 'Aiming Speed',
            data: firepowerAiming,
            tankOrder: originalTankOrder
        }
    ];

    chartDatasets.survivability = [{
            label: 'Tank Hit Points',
            data: survivabilityHp,
            tankOrder: originalTankOrder
        },
        {
            label: 'Crew Hit Points',
            data: survivabilityCrewHp,
            tankOrder: originalTankOrder
        },
        {
            label: 'Track Hit Points',
            data: survivabilityTrackHp,
            tankOrder: originalTankOrder
        }
    ];

    chartDatasets.mobility = [{
            label: 'Forward Speed',
            data: mobilityForward,
            tankOrder: originalTankOrder
        },
        {
            label: 'Reverse Speed',
            data: mobilityReverse,
            tankOrder: originalTankOrder
        },
        {
            label: 'Traverse Speed',
            data: mobilityTraverse,
            tankOrder: originalTankOrder
        }
    ];

    chartDatasets.utility = [{
            label: 'Energy Points',
            data: utilityEnergy,
            tankOrder: originalTankOrder
        },
        {
            label: 'Energy Regen',
            data: utilityRegen,
            tankOrder: originalTankOrder
        },
        {
            label: 'Signal Range',
            data: utilitySpotting,
            tankOrder: originalTankOrder
        }
    ];

    // Update all charts with first stat by default
    updateChart('firepowerChart', 'Firepower', [chartDatasets.firepower[0]], labels);
    updateChart('survivabilityChart', 'Survivability', [chartDatasets.survivability[0]], labels);
    updateChart('mobilityChart', 'Mobility', [chartDatasets.mobility[0]], labels);
    updateChart('utilityChart', 'Utility', [chartDatasets.utility[0]], labels);

    // Initialize stat toggle buttons
    initializeStatToggles();

    // Update chart colors to match current theme
    updateChartColors();
}

function initializeStatToggles() {
    document.querySelectorAll('.chart-stat-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const chartCard = this.closest('.chart-card');
            const chartType = chartCard.querySelector('canvas').id.replace('Chart', '').toLowerCase();
            const statIndex = parseInt(this.dataset.statIndex);

            // Update active state
            this.closest('.chart-card').querySelectorAll('.chart-stat-toggle').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // Update active stat index
            activeStatIndex[chartType] = statIndex;

            // Update just this chart with the selected stat
            updateSingleChart(chartType, statIndex);
        });
    });
}

function updateSingleChart(chartType, statIndex) {
    const chartId = `${chartType}Chart`;
    const chartName = chartType.charAt(0).toUpperCase() + chartType.slice(1);
    const dataset = chartDatasets[chartType][statIndex];

    // Get the current chart's labels from the existing chart
    let labels = [];
    let currentChart;

    switch (chartType.toLowerCase()) {
        case 'firepower':
            currentChart = firepowerChart;
            break;
        case 'survivability':
            currentChart = survivabilityChart;
            break;
        case 'mobility':
            currentChart = mobilityChart;
            break;
        case 'utility':
            currentChart = utilityChart;
            break;
    }

    if (currentChart && currentChart.data && currentChart.data.labels) {
        labels = currentChart.data.labels;
    }

    // Update the chart with just the selected stat
    updateChart(chartId, chartName, [{
        ...dataset,
        tankOrder: chartDatasets[chartType][0].tankOrder
    }], labels);

    // Update chart colors to match current theme
    updateChartColors();
}

function updateChart(chartId, chartName, datasets, labels) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const legendContainer = document.getElementById(`${chartId}Legend`);

    // Clear previous legend
    if (legendContainer) {
        legendContainer.innerHTML = '';
    }

    // Get the original tank order from the first dataset
    const originalTankOrder = datasets[0].tankOrder || [];

    // Create an array of objects that maintain the relationship between labels and data
    const dataWithLabels = originalTankOrder.map((tank, index) => ({
        id: tank.id,
        name: tank.name,
        type: tank.type,
        values: datasets.map(dataset => dataset.data[index]),
        isCurrentTank: tank.id.toString() === currentTankId.toString()
    }));

    // Sort based on the first dataset's values (main sort key)
    let sortedData = [...dataWithLabels];
    if (datasets.length > 0 && datasets[0].data.length > 0) {
        sortedData.sort((a, b) => {
            // Handle null/undefined values by putting them at the end
            if (a.values[0] == null) return 1;
            if (b.values[0] == null) return -1;
            return a.values[0] - b.values[0];
        });
    }

    // Get the sorted labels and datasets
    const sortedLabels = sortedData.map(item => item.name);
    const sortedDatasets = datasets.map(dataset => {
        // Create a mapping from tank ID to data point
        const idToData = {};
        dataWithLabels.forEach((item, index) => {
            idToData[item.id] = dataset.data[index];
        });

        // Create sorted data array based on the sorted data
        return {
            ...dataset,
            data: sortedData.map(item => idToData[item.id])
        };
    });

    // Find the current tank's new position after sorting
    const currentTankNewIndex = sortedData.findIndex(item => item.isCurrentTank);

    // Prepare datasets with different colors
    const chartDatasets = sortedDatasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: sortedData.map((item) =>
            item.isCurrentTank ?
            'rgba(75, 192, 192, 0.7)' : // Current tank - teal
            chartColors[index % chartColors.length]
        ),
        borderColor: sortedData.map((item) =>
            item.isCurrentTank ?
            'rgba(75, 192, 192, 1)' : // Current tank - teal border
            chartBorderColors[index % chartBorderColors.length]
        ),
        borderWidth: sortedData.map((item) =>
            item.isCurrentTank ? 2 : 1 // Thicker border for current tank
        )
    }));

    // Create legend items
    if (legendContainer) {
        sortedData.forEach((item, index) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'chart-legend-item';

            // Add special styling for current tank
            if (item.isCurrentTank) {
                legendItem.classList.add('current-tank');
            }

            const colorBox = document.createElement('div');
            colorBox.className = 'chart-legend-color';
            colorBox.style.backgroundColor = item.isCurrentTank ?
                'rgba(75, 192, 192, 0.7)' : // Current tank - teal
                chartColors[0];

            // Add border to current tank legend color box
            if (item.isCurrentTank) {
                colorBox.style.border = '2px solid rgba(75, 192, 192, 1)';
            }

            const labelSpan = document.createElement('span');
            labelSpan.textContent = item.name || 'Unknown';

            // Add indicator for current tank
            if (item.isCurrentTank) {
                labelSpan.textContent += ' (Current)';
                labelSpan.style.fontWeight = 'bold';
            }

            legendItem.appendChild(colorBox);
            legendItem.appendChild(labelSpan);
            legendContainer.appendChild(legendItem);
        });
    }

    // Destroy previous chart if it exists
    if (chartId === 'firepowerChart' && firepowerChart) {
        firepowerChart.destroy();
    } else if (chartId === 'survivabilityChart' && survivabilityChart) {
        survivabilityChart.destroy();
    } else if (chartId === 'mobilityChart' && mobilityChart) {
        mobilityChart.destroy();
    } else if (chartId === 'utilityChart' && utilityChart) {
        utilityChart.destroy();
    }

    // Create new chart
    const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedLabels,
            datasets: chartDatasets
        },
        options: {
            ...chartConfig,
            plugins: {
                ...chartConfig.plugins,
                title: {
                    display: true
                },
                tooltip: {
                    ...chartConfig.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            const isCurrentTank = sortedData[context.dataIndex].isCurrentTank;
                            const prefix = isCurrentTank ? '★ ' : '';
                            return `${prefix}${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                ...chartConfig.scales,
                x: {
                    ...chartConfig.scales.x,
                    stacked: true
                },
                y: {
                    ...chartConfig.scales.y,
                    stacked: false
                }
            }
        }
    });

    // Store reference to the chart
    if (chartId === 'firepowerChart') {
        firepowerChart = newChart;
    } else if (chartId === 'survivabilityChart') {
        survivabilityChart = newChart;
    } else if (chartId === 'mobilityChart') {
        mobilityChart = newChart;
    } else if (chartId === 'utilityChart') {
        utilityChart = newChart;
    }
}

function showNoDataMessage() {
    const chartContainers = document.querySelectorAll('.chart-container');

    chartContainers.forEach(container => {
        if (!container.querySelector('.chart-no-data')) {
            const noDataDiv = document.createElement('div');
            noDataDiv.className = 'chart-no-data';
            noDataDiv.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <p>No comparison data available</p>
            `;
            container.innerHTML = '';
            container.appendChild(noDataDiv);
        }
    });
}

// Function to fetch tank data based on ID
async function fetchTankData(tankId) {
    try {
        // First fetch the tanks.json to get the tank details
        const tanksResponse = await fetch('https://cdn.jsdelivr.net/gh/PCWStats/Website-Configs@main/tanks.json');
        const tanksData = await tanksResponse.json();

        // Find the tank with matching ID
        const tank = tanksData.find(t => t.id.toString() === tankId.toString());

        if (!tank) {
            console.error('Tank not found with ID:', tankId);
            return;
        }

        // Update page elements with tank data
        updateTankPageElements(tank);

        // Fetch and populate agents data if available
        if (tank.agents) {
            await fetchAndPopulateAgents(tank.agents, tank.id);
        }

        // Fetch stock data if available
        if (tank.stock) {
            await fetchAndPopulateStockData(tank.stock, tank.id, tank.slug);
        }

        // Fetch builds data if available
        if (tank.builds) {
            await fetchAndPopulateBuilds(tank.builds, tank.id);
        }

    } catch (error) {
        console.error('Error fetching tank data:', error);
    }
}

async function fetchAndPopulateStockData(stockUrl, tankId, tankSlug) {
    try {
        const stockResponse = await fetch(stockUrl);
        const stockData = await stockResponse.json();

        console.log('Stock data loaded:', stockData);

        // Try different ways to find the tank stats
        let tankStats;

        // Try by exact ID match first
        if (stockData[tankId]) {
            tankStats = stockData[tankId];
        }
        // Try by slug if ID didn't work
        else if (tankSlug && stockData[tankSlug]) {
            tankStats = stockData[tankSlug];
        }
        // Try case-insensitive ID match
        else {
            const tankKey = Object.keys(stockData).find(key =>
                key.toLowerCase() === tankId.toString().toLowerCase() ||
                (tankSlug && key.toLowerCase() === tankSlug.toLowerCase())
            );

            if (tankKey) {
                tankStats = stockData[tankKey];
            }
        }

        if (tankStats) {
            console.log('Found tank stats:', tankStats);
            populateTankStats(tankStats);

            // Calculate and display GSS scores
            calculateAndDisplayGSS(tankStats, tankId);
        } else {
            console.error('No stats found for tank:', {
                id: tankId,
                slug: tankSlug,
                availableKeys: Object.keys(stockData)
            });
        }
    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
}

async function calculateAndDisplayGSS(currentTankStats, currentTankId) {
    try {
        // First fetch all tanks data
        const tanksResponse = await fetch('https://cdn.jsdelivr.net/gh/PCWStats/Website-Configs@main/tanks.json');
        const tanksData = await tanksResponse.json();

        // Then fetch all stock data for comparison
        const allStockData = {};
        const stockPromises = tanksData.map(async tank => {
            try {
                const response = await fetch(tank.stock);
                const data = await response.json();
                // Try different ways to get the stats for this tank
                const tankStats = data[tank.id] || data[tank.slug] || Object.values(data)[0];
                if (tankStats) {
                    allStockData[tank.id] = tankStats;
                }
            } catch (error) {
                console.error(`Error fetching stock data for tank ${tank.id}:`, error);
            }
        });

        await Promise.all(stockPromises);

        // Filter out unreleased tanks (all stats = 0)
        const validTanks = {};
        for (const [tankId, stats] of Object.entries(allStockData)) {
            if (!isUnreleasedTank(stats)) {
                validTanks[tankId] = stats;
            }
        }

        // If no valid tanks to compare with, set all scores to 0
        if (Object.keys(validTanks).length === 0) {
            updateGSSScores({
                FIREPOWER: 0,
                SURVIVABILITY: 0,
                MOBILITY: 0,
                RECON: 0,
                UTILITY: 0
            });
            return;
        }

        // Calculate GSS for each category
        const gssScores = {
            FIREPOWER: calculateCategoryGSS(currentTankStats.FIREPOWER, validTanks, 'FIREPOWER'),
            SURVIVABILITY: calculateCategoryGSS(currentTankStats.SURVIVABILITY, validTanks, 'SURVIVABILITY'),
            MOBILITY: calculateCategoryGSS(currentTankStats.MOBILITY, validTanks, 'MOBILITY'),
            RECON: calculateCategoryGSS(currentTankStats.RECON, validTanks, 'RECON'),
            UTILITY: calculateCategoryGSS(currentTankStats.UTILITY, validTanks, 'UTILITY')
        };

        // Update the GSS scores in the UI
        updateGSSScores(gssScores);

    } catch (error) {
        console.error('Error calculating GSS:', error);
        // Set all scores to 0 if there's an error
        updateGSSScores({
            FIREPOWER: 0,
            SURVIVABILITY: 0,
            MOBILITY: 0,
            RECON: 0,
            UTILITY: 0
        });
    }
}

function isUnreleasedTank(stats) {
    // Check if all stats are 0 (unreleased tank)
    if (!stats) return true;

    for (const category in stats) {
        for (const stat in stats[category]) {
            const value = parseFloat(stats[category][stat]);
            if (value !== 0 && !isNaN(value)) {
                return false;
            }
        }
    }
    return true;
}

function calculateCategoryGSS(currentCategoryStats, allTanksStats, categoryName) {
    if (!currentCategoryStats) return 0;

    // Collect all values for each stat in this category across all tanks
    const statValues = {};

    // Initialize statValues with current tank's stats
    for (const stat in currentCategoryStats) {
        statValues[stat] = [];
    }

    // Add stats from all other tanks
    for (const tankId in allTanksStats) {
        const tankStats = allTanksStats[tankId];
        if (tankStats && tankStats[categoryName]) {
            for (const stat in currentCategoryStats) {
                if (tankStats[categoryName][stat] !== undefined) {
                    const value = parseFloat(tankStats[categoryName][stat]);
                    if (!isNaN(value)) {
                        statValues[stat].push(value);
                    }
                }
            }
        }
    }

    // Calculate normalized scores for each stat (0-1000)
    const normalizedScores = {};
    for (const stat in statValues) {
        const values = statValues[stat];
        if (values.length === 0) continue;

        const currentValue = parseFloat(currentCategoryStats[stat]);
        if (isNaN(currentValue)) continue;

        const min = Math.min(...values);
        const max = Math.max(...values);

        // Handle case where all values are the same
        if (min === max) {
            normalizedScores[stat] = 500; // Average score if all values are equal
        } else {
            // Calculate normalized score (0-1000)
            normalizedScores[stat] = Math.round(((currentValue - min) / (max - min)) * 1000);
            // Ensure score is within bounds
            normalizedScores[stat] = Math.max(0, Math.min(1000, normalizedScores[stat]));
        }
    }

    // Calculate average score for the category
    const statCount = Object.keys(normalizedScores).length;
    if (statCount === 0) return 0;

    const sum = Object.values(normalizedScores).reduce((a, b) => a + b, 0);
    return Math.round(sum / statCount);
}

function updateGSSScores(gssScores) {
    // Get all stat categories in the DOM
    const statCategories = document.querySelectorAll('.stats-category');

    statCategories.forEach(category => {
        const header = category.querySelector('h3');
        if (!header) return;

        const categoryName = header.textContent.trim().toUpperCase();
        const scoreElement = category.querySelector('.score');

        if (scoreElement && gssScores[categoryName] !== undefined) {
            const score = gssScores[categoryName];
            scoreElement.textContent = score;

            // Add color coding based on score (not implemented)
            if (score >= 750) {
                scoreElement.style.color = '#e0e0e0'; // Green for high scores
            } else if (score >= 500) {
                scoreElement.style.color = '#e0e0e0'; // Yellow for medium-high scores
            } else if (score >= 250) {
                scoreElement.style.color = '#e0e0e0'; // Orange for medium-low scores
            } else {
                scoreElement.style.color = '#e0e0e0'; // Red for low scores
            }
        }
    });
}

async function fetchAndPopulateBuilds(buildsUrl, tankId) {
    const buildsContainer = document.getElementById('builds-container');
    const viewAllButton = document.querySelector('.action-buttons .btn-accent:first-child');

    try {
        const buildsResponse = await fetch(buildsUrl);
        const buildsData = await buildsResponse.json();

        // Filter builds to only include those with buildFeatured: true
        const featuredBuilds = buildsData.buildList.filter(build => build.buildFeatured === true);

        // If there are featured builds, show them (max 3, sorted by date)
        if (featuredBuilds.length > 0) {
            // Sort builds by date (newest first)
            featuredBuilds.sort((a, b) => {
                const dateA = new Date(a.buildDate.split('-').reverse().join('-'));
                const dateB = new Date(b.buildDate.split('-').reverse().join('-'));
                return dateB - dateA;
            });

            // Show only the latest 3 featured builds
            const buildsToShow = featuredBuilds.slice(0, 3);
            populateBuilds(buildsToShow);

            if (viewAllButton) viewAllButton.style.display = 'inline-block';
        } else {
            // No featured builds available, show placeholder
            showBuildsPlaceholder();
            if (viewAllButton) viewAllButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching builds data:', error);
        showBuildsPlaceholder();
        if (viewAllButton) viewAllButton.style.display = 'none';
    }
}

function populateBuilds(builds) {
    const buildsContainer = document.getElementById('builds-container');
    if (!buildsContainer) {
        console.error('Builds container not found');
        return;
    }

    // Clear existing content
    buildsContainer.innerHTML = '';

    // Create build cards for each build
    builds.forEach(build => {
        const buildCard = document.createElement('div');
        buildCard.className = 'build-card';
        buildCard.innerHTML = `
            <div class="build-header">
                ${build.buildName}
            </div>
            <div class="build-content">
                <div class="build-section">
                    <div class="build-section-title">
                        <i class="fas fa-puzzle-piece"></i>
                        <span>Modules</span>
                    </div>
                    <div class="build-items">
                        ${build.modules.map(module => `
                            <div class="build-item">
                                <img src="${module.moduleIcon}" alt="${module.moduleName}">
                                <div class="build-item-tooltip">
                                    <div class="build-item-name">${module.moduleName}</div>
                                    <div class="build-item-description">${module.moduleDescription}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="build-section">
                    <div class="build-section-title">
                        <i class="fas fa-star"></i>
                        <span>Perks</span>
                    </div>
                    <div class="build-items perk-items">
                        ${build.perks.map(perk => `
                            <div class="build-item">
                                <img src="${perk.perkIcon}" alt="${perk.perkName}">
                                <div class="build-item-tooltip">
                                    <div class="build-item-name">${perk.perkName}</div>
                                    <div class="build-item-description">${perk.perkDescription}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="build-section">
                    <div class="build-section-title">
                        <i class="fas fa-toolbox"></i>
                        <span>Equipment</span>
                    </div>
                    <div class="build-items equipment-items">
                        ${build.equipments.map(equipment => `
                            <div class="build-item">
                                <img src="${equipment.equipmentIcon}" alt="${equipment.equipmentName}">
                                <div class="build-item-tooltip">
                                    <div class="build-item-name">${equipment.equipmentName}</div>
                                    <div class="build-item-description">${equipment.equipmentDescription}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        buildsContainer.appendChild(buildCard);
    });

    // Adjust tooltip positions after DOM update
    setTimeout(adjustTooltipPosition, 0);
}

function showBuildsPlaceholder() {
    const buildsContainer = document.getElementById('builds-container');
    if (!buildsContainer) return;

    buildsContainer.innerHTML = `
        <div class="builds-placeholder">
            <div class="placeholder-content">
                <i class="fas fa-tools"></i>
                <h3>Builds Coming Soon</h3>
                <p>We're currently collecting and analyzing the best builds for this tank. Check back soon or contribute your own build!</p>
                <a href="../../../contact-us.html#main" class="btn-accent">
                    <i></i> Submit Your Build
                </a>
            </div>
        </div>
    `;
}

function adjustTooltipPosition() {
    document.querySelectorAll('.build-item').forEach(item => {
        const tooltip = item.querySelector('.build-item-tooltip');
        if (!tooltip) return;

        item.addEventListener('mouseenter', function() {
            // Make tooltip visible temporarily for measurements
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';

            const tooltipRect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const itemRect = item.getBoundingClientRect();

            // Reset positioning
            tooltip.style.left = '50%';
            tooltip.style.right = 'auto';
            tooltip.style.bottom = 'calc(100% + 10px)';
            tooltip.style.top = 'auto';
            tooltip.style.transform = 'translateX(-50%)';

            // Check right edge overflow
            if (tooltipRect.right > viewportWidth) {
                tooltip.style.left = 'auto';
                tooltip.style.right = '0';
                tooltip.style.transform = 'none';
            }

            // Check left edge overflow
            if (tooltipRect.left < 0) {
                tooltip.style.left = '0';
                tooltip.style.right = 'auto';
                tooltip.style.transform = 'none';
            }

            // Check if tooltip would go above viewport
            if (tooltipRect.top < 0) {
                tooltip.style.bottom = 'auto';
                tooltip.style.top = 'calc(100% + 10px)';
                tooltip.style.transform = 'translateX(-50%)';

                // Adjust arrow position
                const arrow = tooltip.querySelector(':after') || document.createElement('div');
                arrow.style.content = '';
                arrow.style.position = 'absolute';
                arrow.style.bottom = '100%';
                arrow.style.left = '50%';
                arrow.style.transform = 'translateX(-50%)';
                arrow.style.borderWidth = '8px';
                arrow.style.borderStyle = 'solid';
                arrow.style.borderColor = 'transparent transparent var(--card-bg) transparent';
            }
        });

        item.addEventListener('mouseleave', function() {
            // Reset tooltip visibility
            tooltip.style.visibility = '';
            tooltip.style.opacity = '';
        });
    });
}

async function fetchAndPopulateAgents(agentsUrl, tankId) {
    try {
        const agentsResponse = await fetch(agentsUrl);
        const agentsData = await agentsResponse.json();

        if (agentsData && agentsData.agents && agentsData.agents.length > 0) {
            populateAgents(agentsData.agents);

            // Update agent count in header
            const agentCountSpan = document.querySelector('.tank-header .tank-meta span:nth-child(3)');
            if (agentCountSpan) {
                agentCountSpan.innerHTML = `<i class="fas fa-users mr-1"></i> Number of Agents: ${agentsData.agents.length}`;
            }

            // Reinitialize agent modals after populating agents
            initializeAgentModals();
        } else {
            console.warn('No agents data found in:', agentsUrl);
        }
    } catch (error) {
        console.error('Error fetching agents data:', error);
    }
}

function populateAgents(agents) {
    // Look for the container by its ID instead of using the adjacent selector
    const agentsContainer = document.getElementById('agents-container');
    if (!agentsContainer) {
        console.error('Agents container not found');
        return;
    }

    // Clear existing content
    agentsContainer.innerHTML = '';

    // Create agent cards for each agent
    agents.forEach(agent => {
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';

        agentCard.innerHTML = `
            <div class="agent-image">
                <img src="${agent.image}" alt="${agent.name}">
            </div>
            <div class="agent-info">
                <h3>${agent.name}</h3>
                <p class="agent-specialty">${agent.specialty}</p>
                <p class="agent-description">${agent.description}</p>
            </div>
        `;

        agentsContainer.appendChild(agentCard);
    });
}

function updateTankPageElements(tank) {
    // Update page title and meta tags
    document.title = `${tank.name} - PCWStats`;
    document.querySelector('meta[property="og:title"]').content = `PCWStats - ${tank.name}`;
    document.querySelector('meta[name="twitter:title"]').content = `PCWStats - ${tank.name}`;

    // Update tank header information
    const tankHeader = document.querySelector('.tank-header');
    if (tankHeader) {
        const typeBadge = tankHeader.querySelector('.tank-type-badge');
        if (typeBadge && tank.type !== "Unknown") {
            typeBadge.textContent = tank.type;
        }

        const nationSpan = tankHeader.querySelector('.tank-meta span:nth-child(2)');
        if (nationSpan) {
            nationSpan.innerHTML = `<i class="fas fa-flag mr-1"></i> ${tank.nation}`;
        }

        const tankTitle = tankHeader.querySelector('.tank-title');
        if (tankTitle) {
            tankTitle.textContent = tank.name;
        }
    }

    // Update tank image
    const tankImage = document.querySelector('.tank-image img');
    if (tankImage) {
        tankImage.src = tank.image;
        tankImage.alt = tank.name;
    }
}

function initializeAgentModals() {
    // Agent modal elements
    const agentModal = document.getElementById('agentModal');
    const agentModalOverlay = document.getElementById('agentModalOverlay');
    const agentModalClose = document.getElementById('agentModalClose');
    const agentModalImage = document.getElementById('agentModalImage');
    const agentModalName = document.getElementById('agentModalName');
    const agentModalSpecialty = document.getElementById('agentModalSpecialty');
    const agentModalDescription = document.getElementById('agentModalDescription');
    const agentModalStory = document.getElementById('agentModalStory');
    const agentModalTanksContainer = document.getElementById('agentModalTanksContainer');

    // Set up click handlers for all agent cards
    document.querySelectorAll('.agent-card').forEach(card => {
        card.addEventListener('click', async function() {
            const agentName = this.querySelector('h3').textContent;

            // Get the tank ID from meta tag to fetch the correct agents.json
            const tankIdMeta = document.querySelector('meta[name="tank-id"]');
            const tankId = tankIdMeta ? tankIdMeta.content : null;

            if (!tankId) {
                console.error('No tank ID found');
                return;
            }

            try {
                // First get the tank data to find the agents URL
                const tanksResponse = await fetch('https://cdn.jsdelivr.net/gh/PCWStats/Website-Configs@main/tanks.json');
                const tanksData = await tanksResponse.json();
                const tank = tanksData.find(t => t.id.toString() === tankId.toString());

                if (!tank || !tank.agents) {
                    console.error('Tank or agents URL not found');
                    return;
                }

                // Fetch the agents data
                const agentsResponse = await fetch(tank.agents);
                const agentsData = await agentsResponse.json();

                // Find the clicked agent
                const agent = agentsData.agents.find(a => a.name === agentName);

                if (!agent) {
                    console.error('Agent not found:', agentName);
                    return;
                }

                // Populate modal with agent data
                agentModalImage.src = agent.image;
                agentModalImage.alt = agentName;
                agentModalName.textContent = agentName;
                agentModalSpecialty.textContent = agent.specialty;
                agentModalDescription.textContent = agent.description;
                agentModalStory.textContent = agent.story;

                // Clear previous tank images
                agentModalTanksContainer.innerHTML = '';

                // Add compatible tanks with clickable links
                if (agent.compatibleTanks && agent.compatibleTanks.length > 0) {
                    agent.compatibleTanks.forEach(tank => {
                        const tankElement = document.createElement('div');
                        tankElement.className = 'agent-modal-tank';

                        // Create link to tank page
                        const tankLink = document.createElement('a');
                        tankLink.href = `../tanks/${tank.slug}.html`; // Using slug for URL
                        tankLink.style.display = 'contents'; // Makes link inherit parent's display

                        // Create tank image
                        const tankImg = document.createElement('img');
                        tankImg.src = tank.image;
                        tankImg.alt = tank.name;
                        tankImg.loading = 'lazy'; // Lazy loading for better performance

                        // Create tank name
                        const tankName = document.createElement('span');
                        tankName.textContent = tank.name;

                        // Append elements
                        tankLink.appendChild(tankImg);
                        tankLink.appendChild(tankName);
                        tankElement.appendChild(tankLink);
                        agentModalTanksContainer.appendChild(tankElement);
                    });
                }

                // Show modal
                agentModal.classList.add('active');
                agentModalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';

            } catch (error) {
                console.error('Error loading agent data:', error);
            }
        });
    });

    // Close modal handlers
    agentModalOverlay.addEventListener('click', closeAgentModal);
    agentModalClose.addEventListener('click', closeAgentModal);

    // Close with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && agentModal.classList.contains('active')) {
            closeAgentModal();
        }
    });

    function closeAgentModal() {
        agentModal.classList.remove('active');
        agentModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Function to populate tank stats from stock data
function populateTankStats(tankStats) {
    // Helper function to update stat values
    function updateStat(category, statName, value) {
        // Find all stat categories
        const categories = document.querySelectorAll('.stats-category');

        // Find the matching category
        let targetCategory = null;
        categories.forEach(cat => {
            const h3 = cat.querySelector('h3');
            if (h3 && h3.textContent.includes(category)) {
                targetCategory = cat;
            }
        });

        if (!targetCategory) return;

        // Find all stat items in this category
        const statItems = targetCategory.querySelectorAll('.stat-item');

        // Find the matching stat item
        let targetItem = null;
        statItems.forEach(item => {
            const nameElement = item.querySelector('.stat-name');
            if (nameElement && nameElement.textContent.includes(statName)) {
                targetItem = item;
            }
        });

        if (!targetItem) return;

        // Update the value
        const valueElement = targetItem.querySelector('.stat-value');
        if (valueElement) {
            valueElement.textContent = value;
        }
    }

    // Firepower stats
    if (tankStats.FIREPOWER) {
        const fp = tankStats.FIREPOWER;
        updateStat('Firepower', 'Damage', fp.DAMAGE);
        updateStat('Firepower', 'Penetration', fp.PENETRATION);
        updateStat('Firepower', 'Aiming Speed', fp["AIMING SPEED"]);
        updateStat('Firepower', 'Reload Time', fp["RELOAD TIME"]);
        updateStat('Firepower', 'Time Between Shots', fp["TIME BETWEEN SHOTS"]);
        updateStat('Firepower', 'Shells in Magazine', fp["SHELLS IN MAGAZINE"]);
        updateStat('Firepower', 'Magazine Count', fp["MAGAZINE COUNT"]);
        updateStat('Firepower', 'Time to Load Next Magazine', fp["TIME TO LOAD NEXT MAGAZINE"]);
        updateStat('Firepower', 'Reticle Size, Moving', fp["RETICLE SIZE, MOVING"]);
        updateStat('Firepower', 'Reticle Size, Rotating Hull', fp["RETICLE SIZE, ROTATING HULL"]);
        updateStat('Firepower', 'Reticle Size, Standing', fp["RETICLE SIZE, STANDING"]);
        updateStat('Firepower', 'Reticle Size, After Shot', fp["RETICLE SIZE, AFTER SHOT"]);
        updateStat('Firepower', 'Reticle Size, Max', fp["RETICLE SIZE, MAX"]);
        updateStat('Firepower', 'Turret Traverse Speed, Degrees/Second', fp["TURRET TRAVERSE SPEED"]);
        updateStat('Firepower', 'Gun Elevation Speed, Degrees/Second', fp["GUN ELEVATION, DEGREES/SECOND"]);
        updateStat('Firepower', 'Gun Depression (Front)', fp["GUN DEPRESSION, FRONT"]);
        updateStat('Firepower', 'Gun Depression (Side)', fp["GUN DEPRESSION, SIDE"]);
        updateStat('Firepower', 'Gun Depression (Rear)', fp["GUN DEPRESSION, REAR"]);
        updateStat('Firepower', 'Gun Elevation (Front)', fp["GUN ELEVATION, FRONT"]);
        updateStat('Firepower', 'Gun Elevation (Side)', fp["GUN ELEVATION, SIDE"]);
        updateStat('Firepower', 'Gun Elevation (Rear)', fp["GUN ELEVATION, REAR"]);
    }

    // Survivability stats
    if (tankStats.SURVIVABILITY) {
        const surv = tankStats.SURVIVABILITY;
        updateStat('Survivability', 'Hit Points', surv["HIT POINTS"]);
        updateStat('Survivability', 'Incoming Crit Damage, Ammo Rack', surv["INCOMING CRIT DAMAGE, AMMO RACK"]);
        updateStat('Survivability', 'Track Repair Time, Seconds', surv["TRACK REPAIR TIME, SECONDS"]);
        updateStat('Survivability', 'Crew Hit Points', surv["CREW HIT POINTS"]);
        updateStat('Survivability', 'Crew Recovery Time, Seconds', surv["CREW RECOVERY TIME, SECONDS"]);
        updateStat('Survivability', 'Incoming Crit Damage, Engine', surv["INCOMING CRIT DAMAGE, ENGINE"]);
        updateStat('Survivability', 'Engine Hit Points', surv["ENGINE HIT POINTS"]);
        updateStat('Survivability', 'Engine Repair Time, Seconds', surv["ENGINE REPAIR TIME, SECONDS"]);
        updateStat('Survivability', 'Fire Duration, Seconds', surv["FIRE DURATION, SECONDS"]);
        updateStat('Survivability', 'Fire Damage', surv["FIRE DAMAGE"]);
        updateStat('Survivability', 'Incoming Crit Damage, Fuel Tank', surv["INCOMING CRIT DAMAGE, FUEL TANK"]);
        updateStat('Survivability', 'Fire Damage Rate', surv["FIRE DAMAGE RATE"]);
        updateStat('Survivability', 'Ramming Damage Resistance, Front', surv["RAMMING DAMAGE RESISTANCE, FRONT"]);
        updateStat('Survivability', 'Ramming Damage Bonus', surv["RAMMING DAMAGE BONUS"]);
        updateStat('Survivability', 'Repair Kit Cooldown, Seconds', surv["REPAIR KIT COOLDOWN, SECONDS"]);
        updateStat('Survivability', 'Track Hit Points', surv["TRACK HIT POINTS"]);
        updateStat('Survivability', 'Ltrackamounttoregen', surv["LTRACKAMOUNTTOREGEN"]);
    }

    // Mobility stats
    if (tankStats.MOBILITY) {
        const mob = tankStats.MOBILITY;
        updateStat('Mobility', 'Forward Speed, km/h', mob["FORWARD SPEED, KM/H"]);
        updateStat('Mobility', 'Reverse Speed, km/h', mob["REVERSE SPEED, KM/H"]);
        updateStat('Mobility', 'Base Acceleration', mob["BASE ACCELERATION"]);
        updateStat('Mobility', 'Traverse Speed', mob["TRAVERSE SPEED"]);
        updateStat('Mobility', 'Sprint Energy Cost', mob["SPRINT ENERGY COST"]);
        updateStat('Mobility', 'Sprint Energy Volume', mob["SPRINT ENERGY VOLUME"]);
        updateStat('Mobility', 'Sprint Regen Rate', mob["SPRINT REGEN RATE"]);
        updateStat('Mobility', 'Ramming Mass Measure', mob["RAMMING MASS MEASURE"]);
    }

    // Recon stats
    if (tankStats.RECON) {
        const recon = tankStats.RECON;
        updateStat('Recon', 'Spotting Angle, Degrees', recon["SPOTTING ANGLE, DEGREES"]);
        updateStat('Recon', 'Spotting Range, Meters', recon["SPOTTING RANGE, METERS"]);
        updateStat('Recon', 'Spotting Duration, Seconds', recon["SPOTTING DURATION, SECONDS"]);
        updateStat('Recon', 'Signal Range, Meters', recon["SIGNAL RANGE, METERS"]);
        updateStat('Recon', 'X-Ray Radius, Meters', recon["X-RAY RADIUS, METERS"]);
    }

    // Utility stats
    if (tankStats.UTILITY) {
        const util = tankStats.UTILITY;
        updateStat('Utility', 'Energy Points', util["ENERGY POINTS"]);
        updateStat('Utility', 'Energy Regeneration', util["ENERGY REGENERATION"]);
        updateStat('Utility', 'Smoke Cooldown, Seconds', util["SMOKE COOLDOWN, SECONDS"]);
        updateStat('Utility', 'Smoke Energy Cost', util["SMOKE ENERGY COST"]);
        updateStat('Utility', 'Smoke Use Count', util["SMOKE USE COUNT"]);
    }
}

function initializeAccordions() {
    // Initialize strengths accordion
    const strengthsAccordion = document.querySelector('.strengths-accordion');
    if (strengthsAccordion) {
        const strengthItems = strengthsAccordion.querySelectorAll('.accordion-item');

        strengthItems.forEach(item => {
            const header = item.querySelector('.accordion-header');

            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all other items in this accordion
                strengthItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    }

    // Initialize weaknesses accordion
    const weaknessesAccordion = document.querySelector('.weaknesses-accordion');
    if (weaknessesAccordion) {
        const weaknessItems = weaknessesAccordion.querySelectorAll('.accordion-item');

        weaknessItems.forEach(item => {
            const header = item.querySelector('.accordion-header');

            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all other items in this accordion
                weaknessItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    }
}

// Update the initializeTankPageElements function to include the accordion initialization
function initializeTankPageElements() {
    // Initialize image gallery
    initializeImageGallery();

    // Initialize accordions
    initializeAccordions();

    // FAQ Accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Add intersection observer for animated elements if needed
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe any elements that need to animate in
        document.querySelectorAll('.map-image, .sidebar-card').forEach(el => {
            observer.observe(el);
        });
    }
}

function initializeImageGallery() {
    const galleryModal = document.getElementById('galleryModal');
    const galleryMainImage = document.getElementById('galleryMainImage');
    const galleryImageCaption = document.getElementById('galleryImageCaption');
    const galleryThumbnailsContainer = document.getElementById('galleryThumbnailsContainer');
    const galleryCloseBtn = document.getElementById('galleryCloseBtn');
    const galleryPrevBtn = document.getElementById('galleryPrevBtn');
    const galleryNextBtn = document.getElementById('galleryNextBtn');

    // Collect all images from the page that should be in the gallery
    const galleryImages = [];

    // Add main content images
    document.querySelectorAll('.map-image img').forEach(img => {
        galleryImages.push({
            src: img.src,
            alt: img.alt,
            caption: img.nextElementSibling?.textContent || ''
        });
    });

    // Add sidebar gallery images
    document.querySelectorAll('.sidebar-card .gallery-thumbnail img').forEach(img => {
        galleryImages.push({
            src: img.parentElement.href,
            alt: img.alt,
            caption: img.alt
        });
    });

    // If no images found, don't initialize the gallery
    if (galleryImages.length === 0) return;

    let currentImageIndex = 0;

    // Function to open the gallery at a specific index
    function openGallery(index) {
        if (index < 0 || index >= galleryImages.length) return;

        currentImageIndex = index;
        updateGalleryImage();
        galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Function to update the gallery with current image
    function updateGalleryImage() {
        const currentImage = galleryImages[currentImageIndex];
        galleryMainImage.src = currentImage.src;
        galleryMainImage.alt = currentImage.alt;
        galleryImageCaption.textContent = currentImage.caption;

        // Update active thumbnail
        document.querySelectorAll('.gallery-thumbnail-item').forEach((thumb, idx) => {
            thumb.classList.toggle('active', idx === currentImageIndex);
        });

        // Scroll thumbnails to show active one
        const activeThumb = document.querySelector('.gallery-thumbnail-item.active');
        if (activeThumb) {
            activeThumb.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }

    // Function to close the gallery
    function closeGallery() {
        galleryModal.classList.remove('active');
        document.body.style.overflow = '';
        galleryMainImage.classList.remove('zoomed');
    }

    // Create thumbnail items
    function createThumbnails() {
        galleryThumbnailsContainer.innerHTML = '';
        galleryImages.forEach((img, index) => {
            const thumbItem = document.createElement('div');
            thumbItem.className = 'gallery-thumbnail-item';
            if (index === currentImageIndex) thumbItem.classList.add('active');

            const thumbImg = document.createElement('img');
            thumbImg.src = img.src;
            thumbImg.alt = img.alt;

            thumbItem.appendChild(thumbImg);
            thumbItem.addEventListener('click', () => {
                currentImageIndex = index;
                updateGalleryImage();
            });

            galleryThumbnailsContainer.appendChild(thumbItem);
        });
    }

    // Initialize thumbnails
    createThumbnails();

    // Set up click handlers for all gallery images
    document.querySelectorAll('.map-image img, .sidebar-card .gallery-thumbnail').forEach((element, index) => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            openGallery(index);
        });
    });

    // Navigation buttons
    galleryPrevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateGalleryImage();
    });

    galleryNextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateGalleryImage();
    });

    // Close button
    galleryCloseBtn.addEventListener('click', closeGallery);

    // Close when clicking outside the image
    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            closeGallery();
        }
    });

    // Zoom functionality
    galleryMainImage.addEventListener('click', () => {
        galleryMainImage.classList.toggle('zoomed');
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!galleryModal.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeGallery();
                break;
            case 'ArrowLeft':
                currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
                updateGalleryImage();
                break;
            case 'ArrowRight':
                currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
                updateGalleryImage();
                break;
        }
    });

    // Swipe support for touch devices
    let touchStartX = 0;
    let touchEndX = 0;

    galleryMainImage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, {
        passive: true
    });

    galleryMainImage.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {
        passive: true
    });

    function handleSwipe() {
        if (touchStartX - touchEndX > 50) {
            // Swipe left - next image
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            updateGalleryImage();
        } else if (touchEndX - touchStartX > 50) {
            // Swipe right - previous image
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            updateGalleryImage();
        }
    }
}