document.addEventListener('DOMContentLoaded', function() {
    // Fetch maintenance data
    fetchMaintenanceData();

    // Initialize waves if the module exists
    if (typeof Waves !== 'undefined') {
        Waves.init();
    }
});

function fetchMaintenanceData() {
    fetch('https://raw.githubusercontent.com/HEATLabs/HEAT-Labs-Configs/refs/heads/main/maintenance.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateMaintenancePage(data);
        })
        .catch(error => {
            console.error('Error fetching maintenance data:', error);
            // Fallback to default values if fetch fails
            updateMaintenancePage({
                message: "HEAT Labs is currently undergoing maintenance. We're working hard to bring you an improved experience.",
                estimated_downtime: "1 hour",
                start_time: "Just now"
            });
        });
}

function updateMaintenancePage(data) {
    // Update message
    const messageElement = document.getElementById('maintenanceMessage');
    if (messageElement && data.message) {
        messageElement.textContent = data.message;
    }

    // Update estimated downtime
    const downtimeElement = document.getElementById('estimatedDowntime');
    if (downtimeElement && data.estimated_downtime) {
        downtimeElement.textContent = data.estimated_downtime;
    }

    // Update start time (format if it's a proper date string)
    const startTimeElement = document.getElementById('startTime');
    if (startTimeElement && data.start_time) {
        try {
            // Try to parse as ISO date
            const startDate = new Date(data.start_time);
            if (!isNaN(startDate.getTime())) {
                // Format as local date and time
                startTimeElement.textContent = startDate.toLocaleString();
            } else {
                // Fallback to raw string
                startTimeElement.textContent = data.start_time;
            }
        } catch (e) {
            startTimeElement.textContent = data.start_time;
        }
    }
}