document.addEventListener('DOMContentLoaded', function() {
    // Load missions data
    fetch('https://raw.githubusercontent.com/PCWStats/Database-Files/refs/heads/main/game-data/missions.json')
        .then(response => response.json())
        .then(data => displayMissions(data.entitlements))
        .catch(error => {
            console.error('Error loading missions data:', error);
            document.getElementById('missionsContainer').innerHTML =
                '<div class="error-message">Failed to load missions data. Please try again later.</div>';
        });

    // Load matchmaker data
    fetch('https://raw.githubusercontent.com/PCWStats/Database-Files/refs/heads/main/game-data/matchmaker.json')
        .then(response => response.json())
        .then(data => displayMatchmakerData(data))
        .catch(error => {
            console.error('Error loading matchmaker data:', error);
            document.getElementById('matchmakerContainer').innerHTML =
                '<div class="error-message">Failed to load matchmaker data. Please try again later.</div>';
        });

    // Display missions data
    function displayMissions(entitlements) {
        const container = document.getElementById('missionsContainer');

        if (!entitlements || entitlements.length === 0) {
            container.innerHTML = '<div class="no-data">No missions data available</div>';
            return;
        }

        let html = '';

        entitlements.forEach(mission => {
            html += `
                <div class="mission-card">
                    <div class="mission-name">${mission.friendlyName}</div>
                    <div class="mission-code">Code: ${mission.code}</div>
                    <div class="mission-tags">
                        ${mission.tags.map(tag => `<span class="mission-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Display matchmaker data
    function displayMatchmakerData(data) {
        const container = document.getElementById('matchmakerContainer');

        if (!data) {
            container.innerHTML = '<div class="no-data">No matchmaker data available</div>';
            return;
        }

        let html = '';

        // Available Vehicles for Bots
        if (data.availableVehiclesForBots) {
            html += `
                <div class="matchmaker-section">
                    <h3>Available Vehicles for Bots</h3>
                    ${Object.entries(data.availableVehiclesForBots).map(([type, vehicles]) => `
                        <div class="matchmaker-item">
                            <h4>${type}</h4>
                            <ul class="matchmaker-list">
                                ${vehicles.map(vehicle => `<li>${vehicle}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Game Modes
        if (data.gameModes && data.gameModes.length > 0) {
            html += `
                <div class="matchmaker-section">
                    <h3>Game Modes</h3>
                    ${data.gameModes.map(mode => `
                        <div class="matchmaker-item">
                            <h4>${mode.key.handle}</h4>
                            <p><strong>Mode Weight:</strong> ${mode.value.modeWeight}</p>
                            <p><strong>Team Size:</strong> ${mode.value.teamSize}</p>
                            <p><strong>Teams Number:</strong> ${mode.value.teamsNumber}</p>

                            <h5>Constraints</h5>
                            <table class="matchmaker-table">
                                <thead>
                                    <tr>
                                        <th>Avg Waiting Time</th>
                                        <th>Max Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${mode.value.constraints.map(constraint => `
                                        <tr>
                                            <td>${constraint.avgWaitingTime}</td>
                                            <td>${constraint.maxScore}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>

                            <h5>Penalties</h5>
                            <ul class="matchmaker-list">
                                ${Object.entries(mode.value.penalties).map(([key, value]) => {
                                    if (typeof value === 'object' && value !== null) {
                                        if (Array.isArray(value)) {
                                            return `<li>
                                                <span class="matchmaker-key">${key}:</span>
                                                <span class="matchmaker-value">${value.length} items</span>
                                            </li>`;
                                        } else {
                                            return `<li>
                                                <span class="matchmaker-key">${key}:</span>
                                                <span class="matchmaker-value">Object with ${Object.keys(value).length} properties</span>
                                            </li>`;
                                        }
                                    } else {
                                        return `<li>
                                            <span class="matchmaker-key">${key}:</span>
                                            <span class="matchmaker-value">${value}</span>
                                        </li>`;
                                    }
                                }).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Newcomer Settings
        if (data.newcomer) {
            html += `
                <div class="matchmaker-section">
                    <h3>Newcomer Settings</h3>
                    <div class="matchmaker-item">
                        <h4>PVE Stage</h4>
                        <p><strong>Max Games Played:</strong> ${data.newcomer.pveStage.maxGamesPlayed}</p>
                        <p><strong>Max Role Points:</strong> ${data.newcomer.pveStage.maxRolePoints}</p>
                    </div>
                    <div class="matchmaker-item">
                        <h4>PVP Stage</h4>
                        <p><strong>Max Games Played:</strong> ${data.newcomer.pvpStage.maxGamesPlayed}</p>
                        <p><strong>Max Role Points:</strong> ${data.newcomer.pvpStage.maxRolePoints}</p>
                    </div>
                </div>
            `;
        }

        // Ratings
        if (data.ratings) {
            html += `
                <div class="matchmaker-section">
                    <h3>Ratings</h3>
                    <div class="matchmaker-item">
                        <h4>Power Brackets</h4>
                        <ul class="matchmaker-list">
                            ${data.ratings.powerBrackets.map(bracket => `<li>${bracket}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="matchmaker-item">
                        <h4>Role Points Brackets</h4>
                        <ul class="matchmaker-list">
                            ${data.ratings.rolePointsBrackets.map(bracket => `<li>${bracket}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="matchmaker-item">
                        <h4>Win/Lose Rating Brackets</h4>
                        <ul class="matchmaker-list">
                            ${data.ratings.winLoseRatingBrackets.map(bracket => `<li>${bracket}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }
});