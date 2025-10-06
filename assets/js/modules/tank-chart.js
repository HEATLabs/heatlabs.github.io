// Initialize charts
let firepowerChart, survivabilityChart, mobilityChart, utilityChart;
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

document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initializeCharts();
});

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
        const tanksResponse = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json');
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

// Helper function to check if tank stats are valid (duplicated from tank.js)
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