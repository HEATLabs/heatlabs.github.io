document.addEventListener('DOMContentLoaded', function() {
    const comparisonTable = document.getElementById('comparisonTable');
    const clearAllBtn = document.getElementById('clearAllComparison');
    let comparisonData = [];
    let tankDetails = {};

    // Load comparison data from localStorage
    function loadComparison() {
        const savedComparison = localStorage.getItem('tankComparison');
        if (savedComparison) {
            comparisonData = JSON.parse(savedComparison);
            // Fetch details for all tanks in comparison
            Promise.all(comparisonData.map(id => fetchTankDetails(id)))
                .then(() => renderComparisonTable());
        }
    }

    // Save comparison data to localStorage
    function saveComparison() {
        localStorage.setItem('tankComparison', JSON.stringify(comparisonData));
        renderComparisonTable();
    }

    // Fetch tank details
    async function fetchTankDetails(tankId) {
        if (tankDetails[tankId]) return tankDetails[tankId];

        try {
            // First get the tank info from tanks.json
            const tanksResponse = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json');
            const tanksData = await tanksResponse.json();
            const tankInfo = tanksData.find(tank => tank.id == tankId);

            if (!tankInfo) return null;

            // Then get the stock stats
            const stockResponse = await fetch(tankInfo.stock);
            const stockData = await stockResponse.json();

            // Combine the data
            const fullData = {
                ...tankInfo,
                stats: stockData[tankInfo.slug] || {}
            };

            tankDetails[tankId] = fullData;
            return fullData;
        } catch (error) {
            console.error('Error fetching tank details:', error);
            return null;
        }
    }

    // Render the comparison table
    async function renderComparisonTable() {
        if (comparisonData.length === 0) {
            comparisonTable.innerHTML = `
                <tr>
                    <td colspan="100" class="comparison-empty py-10">
                        No tanks selected for comparison.<br>
                        <a href="tanks">Browse tanks to compare</a>
                    </td>
                </tr>
            `;
            return;
        }

        // Get all tank details
        const tanks = await Promise.all(comparisonData.map(id => fetchTankDetails(id)));
        const validTanks = tanks.filter(tank => tank !== null);

        if (validTanks.length === 0) {
            comparisonTable.innerHTML = `
                <tr>
                    <td colspan="100" class="comparison-empty py-10">
                        Failed to load tank data. Please try again later.
                    </td>
                </tr>
            `;
            return;
        }

        // Generate table HTML
        let tableHTML = `
            <thead>
                <tr>
                    <th colspan="${validTanks.length + 1}">
                        <div class="comparison-legend">
                            <div class="comparison-legend-item">
                                <div class="comparison-legend-color" style="background-color: rgba(76, 175, 80, 0.3)"></div>
                                <span>Best</span>
                            </div>
                            <div class="comparison-legend-item">
                                <div class="comparison-legend-color" style="background-color: rgba(76, 175, 80, 0.25)"></div>
                            </div>
                            <div class="comparison-legend-item">
                                <div class="comparison-legend-color" style="background-color: rgba(76, 175, 80, 0.2)"></div>
                            </div>
                            <div class="comparison-legend-item">
                                <div class="comparison-legend-color" style="background-color: rgba(255, 235, 59, 0.2)"></div>
                                <span>Middle</span>
                            </div>
                            <div class="comparison-legend-item">
                                <div class="comparison-legend-color" style="background-color: rgba(244, 67, 54, 0.2)"></div>
                            </div>
                            <div class="comparison-legend-item">
                                <div class="comparison-legend-color" style="background-color: rgba(244, 67, 54, 0.25)"></div>
                            </div>
                            <div class="comparison-legend-item">
                                <div class="comparison-legend-color" style="background-color: rgba(244, 67, 54, 0.3)"></div>
                                <span>Worst</span>
                            </div>
                        </div>
                    </th>
                </tr>
                <tr>
                    <th>Stat</th>
        `;

        // Add tank headers
        validTanks.forEach(tank => {
            tableHTML += `
                <th>
                    <div class="tank-header">
                        <img src="${tank.image}" alt="${tank.name}" onerror="this.src='https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Images@main/placeholder/imagefailedtoload.webp'">
                        <div class="tank-name">${tank.name}</div>
                        <div class="tank-meta">
                            <span><i class="fas fa-flag"></i> ${tank.nation}</span>
                            <span><i class="fas fa-layer-group"></i> ${tank.type}</span>
                        </div>
                        <button class="remove-tank" data-tank-id="${tank.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </th>
            `;
        });
        tableHTML += '</tr></thead><tbody>';

        // Add stats rows
        const statCategories = ['FIREPOWER', 'MOBILITY', 'SURVIVABILITY', 'RECON', 'UTILITY'];

        statCategories.forEach(category => {
            if (!validTanks[0].stats[category]) return;

            tableHTML += `<tr class="stat-category"><td colspan="${validTanks.length + 1}">${category}</td></tr>`;

            const stats = Object.keys(validTanks[0].stats[category]);

            stats.forEach(stat => {
                const values = validTanks.map(tank => {
                    const rawValue = tank.stats[category][stat];
                    // Handle string values with + or - signs
                    if (typeof rawValue === 'string') {
                        // For depression/elevation values that include + or -
                        if (rawValue.includes('+') || rawValue.includes('-')) {
                            return parseFloat(rawValue);
                        }
                        // For other numeric values that might be strings
                        return isNaN(rawValue) ? rawValue : parseFloat(rawValue);
                    }
                    return isNaN(rawValue) ? rawValue : parseFloat(rawValue);
                });

                // Determine value range for coloring
                const numericValues = values.filter(v => !isNaN(v));
                if (numericValues.length > 0) {
                    // Special handling for gun depression and elevation stats
                    const isDepression = stat.includes('DEPRESSION');
                    const isElevation = stat.includes('ELEVATION') && !stat.includes('DEGREES/SECOND');

                    let maxValue, minValue;

                    if (isDepression) {
                        // For depression, lower (more negative) is better
                        maxValue = Math.min(...numericValues); // Best value (most negative)
                        minValue = Math.max(...numericValues); // Worst value (least negative)
                    } else if (isElevation) {
                        // For elevation, higher (more positive) is better
                        maxValue = Math.max(...numericValues); // Best value (most positive)
                        minValue = Math.min(...numericValues); // Worst value (least positive)
                    } else {
                        // For all other stats, higher is better (default behavior)
                        maxValue = Math.max(...numericValues);
                        minValue = Math.min(...numericValues);
                    }

                    const valueRange = maxValue - minValue;
                    const step = valueRange / 6; // 7 steps (0-6)

                    tableHTML += `<tr><td>${formatStatName(stat)}</td>`;

                    values.forEach((value, i) => {
                        let cellClass = '';
                        let displayValue = value;

                        if (!isNaN(value)) {
                            if (valueRange > 0) {
                                let stepIndex;
                                if (isDepression) {
                                    // For depression: more negative = better
                                    stepIndex = Math.floor((maxValue - value) / step);
                                    cellClass = `stat-${Math.min(6, stepIndex) + 1}`;
                                } else if (isElevation) {
                                    // For elevation: more positive = better
                                    stepIndex = Math.floor((value - minValue) / step);
                                    cellClass = `stat-${7 - Math.min(6, stepIndex)}`;
                                } else {
                                    // Default behavior for other stats
                                    stepIndex = Math.floor((value - minValue) / step);
                                    cellClass = `stat-${7 - Math.min(6, stepIndex)}`;
                                }
                            } else {
                                cellClass = 'stat-4'; // All values equal
                            }

                            // Format display value with + or - for elevation/depression
                            if (isDepression || isElevation) {
                                displayValue = value >= 0 ? `+${value}` : value.toString();
                            }
                        }

                        tableHTML += `<td class="${cellClass}">${formatStatValue(stat, displayValue)}</td>`;
                    });
                } else {
                    // Non-numeric values
                    tableHTML += `<tr><td>${formatStatName(stat)}</td>`;
                    values.forEach(value => {
                        tableHTML += `<td>${value}</td>`;
                    });
                }

                tableHTML += '</tr>';
            });
        });

        tableHTML += '</tbody>';
        comparisonTable.innerHTML = tableHTML;

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-tank').forEach(button => {
            button.addEventListener('click', function() {
                const tankId = this.getAttribute('data-tank-id');
                removeTankFromComparison(tankId);
            });
        });
    }

    // Format stat names for display
    function formatStatName(stat) {
        // Convert from ALL CAPS to Title Case
        return stat.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Format stat values for display
    function formatStatValue(stat, value) {
        if (isNaN(value)) return value;

        // For depression/elevation values that already have + or -, just add °
        if (typeof value === 'string' && (value.includes('+') || value.includes('-'))) {
            return `${value}°`;
        }

        // Add units for specific stats
        if (stat.includes('SPEED') && stat.includes('AIMING')) {
            return `${value} s`;
        }
        if (stat.includes('TRAVERSE SPEED') || stat.includes('TURRET TRAVERSE SPEED')) {
            return `${value} °/s`;
        }
        if (stat.includes('SPEED') || stat.includes('RANGE') || stat.includes('RADIUS')) {
            return `${value} m`;
        }
        if (stat.includes('DEGREES')) {
            return `${value}°`;
        }
        if (stat.includes('SECONDS') || stat.includes('TIME')) {
            return `${value} s`;
        }
        if (stat.includes('DAMAGE') || stat.includes('HIT POINTS')) {
            return Math.round(value);
        }

        return value;
    }

    // Remove tank from comparison
    function removeTankFromComparison(tankId) {
        comparisonData = comparisonData.filter(id => id != tankId);
        saveComparison();
        renderComparisonTable();
    }

    // Clear all comparison
    function clearAllComparison() {
        comparisonData = [];
        saveComparison();
        renderComparisonTable();
    }

    // Initialize
    loadComparison();
    renderComparisonTable();

    // Event listener for clear all button
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllComparison);
    }
});