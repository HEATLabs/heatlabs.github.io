document.addEventListener('DOMContentLoaded', function() {
    // Load missions data
    fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Database@main/game-data/missions.json')
        .then(response => response.json())
        .then(data => displayMissions(data.entitlements))
        .catch(error => {
            console.error('Error loading missions data:', error);
            document.getElementById('missionsContainer').innerHTML =
                '<div class="error-message">' +
                '<i class="fas fa-exclamation-triangle mr-2"></i>' +
                'Failed to load missions data. Please try again later or check our Discord for updates.' +
                '</div>';
        });

    // Display missions data
    function displayMissions(entitlements) {
        const container = document.getElementById('missionsContainer');

        if (!entitlements || entitlements.length === 0) {
            container.innerHTML =
                '<div class="no-data">' +
                '<i class="fas fa-info-circle mr-2"></i>' +
                'No missions data currently available. Check back later for updates.' +
                '</div>';
            return;
        }

        let html = '';

        entitlements.forEach(mission => {
            html += `
                <div class="mission-card" data-tags="${mission.tags.join(' ')}">
                    <div class="mission-name">
                        <i class="fas fa-flag-checkered mr-2"></i>
                        ${mission.friendlyName}
                    </div>
                    <div class="mission-code">
                        ${mission.code}
                    </div>
                    <div class="mission-tags">
                        ${mission.tags.map(tag => `
                            <span class="mission-tag">
                                <i class="fas fa-tag mr-1"></i>
                                ${tag}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add click handlers to mission cards
        document.querySelectorAll('.mission-card').forEach(card => {
            card.addEventListener('click', function() {
                // In a real implementation, this would open a modal or navigate to a detailed view
                console.log('Mission clicked:', this.querySelector('.mission-name').textContent.trim());
            });
        });
    }
});