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
        }
    }

    // Save comparison data to localStorage
    function saveComparison() {
        localStorage.setItem('tankComparison', JSON.stringify(comparisonData));
    }

    // Fetch tank details
    async function fetchTankDetails(tankId) {
        if (tankDetails[tankId]) return tankDetails[tankId];

        try {
            // First get the tank info from tanks.json
            const tanksResponse = await fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/tanks.json');
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
                    <td colspan="100" class="text-center py-10">
                        No tanks selected for comparison. <a href="tanks.html" class="text-accent-color">Go back to tanks</a>
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
                    <td colspan="100" class="text-center py-10">
                        Failed to load tank data. Please try again later.
                    </td>
                </tr>
            `;
            return;
        }

        // Generate table HTML
        let tableHTML = '';

        // Add headers row
        tableHTML += '<thead><tr><th>Stat</th>';
        validTanks.forEach(tank => {
            tableHTML += `
                <th>
                    <div class="tank-header">
                        <img src="${tank.image}" alt="${tank.name}" onerror="this.src='https://raw.githubusercontent.com/PCWStats/Website-Images/main/placeholder/imagefailedtoload.png'">
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
                    const value = tank.stats[category][stat];
                    return isNaN(value) ? value : parseFloat(value);
                });

                // Determine best and worst values for highlighting
                const numericValues = values.filter(v => !isNaN(v));
                const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : null;
                const minValue = numericValues.length > 0 ? Math.min(...numericValues) : null;

                tableHTML += `<tr><td>${stat}</td>`;

                values.forEach((value, i) => {
                    let cellClass = '';
                    if (!isNaN(value)) {
                        if (value === maxValue) cellClass = 'best-stat';
                        if (value === minValue && maxValue !== minValue) cellClass = 'worst-stat';
                    }

                    tableHTML += `<td class="${cellClass}">${value}</td>`;
                });

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

    // Event listeners
    clearAllBtn.addEventListener('click', clearAllComparison);
});