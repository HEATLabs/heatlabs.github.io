document.addEventListener('DOMContentLoaded', function() {
    // Set initial last updated time to current time
    const initialLastUpdated = new Date().toISOString();
    updateLastUpdatedTime(initialLastUpdated);

    // Fetch status data immediately
    fetchStatusData();

    // Set up auto-refresh every 5 minutes
    setInterval(fetchStatusData, 5 * 60 * 1000);
});

function fetchStatusData() {
    fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/system-status.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Use current time as last updated time
            const currentTime = new Date().toISOString();
            data.last_updated = currentTime;

            // Add last_updated timestamp to each system if not present
            data.systems.forEach(system => {
                if (!system.last_updated) {
                    system.last_updated = currentTime;
                }
            });

            updateStatusPage(data);
        })
        .catch(error => {
            console.error('Error fetching status data:', error);
            showErrorState();
        });
}

function updateStatusPage(data) {
    // Update last updated time
    updateLastUpdatedTime(data.last_updated);

    // Determine overall status based on systems
    const overallStatus = determineOverallStatus(data.systems);

    // Update overall status
    updateOverallStatus(overallStatus);

    // Update systems status
    updateSystemsStatus(data.systems);

    // Update incidents if any
    if (data.incidents && data.incidents.length > 0) {
        updateIncidents(data.incidents);
    }
}

function updateLastUpdatedTime(timestamp) {
    const lastUpdatedElement = document.getElementById('lastUpdated');
    const lastUpdated = new Date(timestamp);
    lastUpdatedElement.textContent = lastUpdated.toLocaleString();
}

function determineOverallStatus(systems) {
    const statusPriority = {
        'major_outage': 4,
        'partial_outage': 3,
        'degraded': 2,
        'maintenance': 1,
        'operational': 0
    };

    let highestStatus = 'operational';
    let maintenanceCount = 0;

    for (const system of systems) {
        if (system.status === 'maintenance') {
            maintenanceCount++;
        }
        if (statusPriority[system.status] > statusPriority[highestStatus]) {
            highestStatus = system.status;
        }
    }

    // Special case: if all systems are in maintenance, show maintenance status
    if (maintenanceCount === systems.length) {
        return 'maintenance';
    }

    return highestStatus;
}

function updateOverallStatus(status) {
  // Remove active class from all summary items first
  document.querySelectorAll('.status-summary-item').forEach(item => {
    item.classList.remove('active');
  });

  // Add active class to the appropriate summary item
  let summaryItem;
  switch (status) {
    case 'operational':
      summaryItem = document.querySelector('.status-summary-item.all-operational');
      break;
    case 'degraded':
    case 'partial_outage':
      summaryItem = document.querySelector('.status-summary-item.some-issues');
      break;
    case 'major_outage':
      summaryItem = document.querySelector('.status-summary-item.major-outage');
      break;
    case 'maintenance':
      summaryItem = document.querySelector('.status-summary-item.maintenance');
      break;
    default:
      summaryItem = document.querySelector('.status-summary-item.some-issues');
  }

  if (summaryItem) {
    summaryItem.classList.add('active');
  }
}

function updateSystemsStatus(systems) {
    const statusGrid = document.getElementById('statusGrid');

    // Clear loading state
    statusGrid.innerHTML = '';

    // Create cards for each system
    systems.forEach(system => {
        const systemCard = document.createElement('div');
        systemCard.className = 'status-card';

        systemCard.innerHTML = `
          <div class="status-card-header">
            <h3 class="status-card-title">${system.name}</h3>
            <span class="status-indicator ${formatStatusClass(system.status)}">
              <span class="status-dot ${formatStatusClass(system.status)}"></span>
              ${formatStatusText(system.status)}
            </span>
          </div>
          <div class="status-card-body">
            <p class="status-message">${system.message || 'No issues reported'}</p>
            <span class="status-update-time">Last checked: ${new Date(system.last_updated).toLocaleString()}</span>
          </div>
        `;

        statusGrid.appendChild(systemCard);
    });
}

function formatStatusClass(status) {
    return status.replace(/_/g, '-');
}

function updateIncidents(incidents) {
    const incidentsSection = document.getElementById('incidentsSection');
    const incidentsList = document.getElementById('incidentsList');

    // Show incidents section
    incidentsSection.classList.remove('hidden');

    // Clear existing incidents
    incidentsList.innerHTML = '';

    // Add each incident
    incidents.forEach(incident => {
        const incidentItem = document.createElement('div');
        incidentItem.className = `incident-item ${incident.severity}`;

        let updatesHtml = '';
        if (incident.updates && incident.updates.length > 0) {
            updatesHtml = '<div class="incident-updates">';
            incident.updates.forEach(update => {
                updatesHtml += `
                  <div class="incident-update">
                    <span class="update-status ${formatStatusClass(update.status)}">${formatStatusText(update.status)}</span>
                    <p class="update-content">${update.message}</p>
                    <span class="update-time">${new Date(update.time).toLocaleString()}</span>
                  </div>
                `;
            });
            updatesHtml += '</div>';
        }

        incidentItem.innerHTML = `
      <div class="incident-header">
        <h3 class="incident-title">${incident.title}</h3>
        <span class="incident-date">Started: ${new Date(incident.start_time).toLocaleString()}</span>
      </div>
      <div class="incident-body">
        <p>${incident.description}</p>
      </div>
      ${updatesHtml}
    `;

        incidentsList.appendChild(incidentItem);
    });
}

function formatStatusText(status) {
    switch (status) {
        case 'operational':
            return 'Operational';
        case 'degraded':
            return 'Degraded';
        case 'partial_outage':
            return 'Partial Outage';
        case 'major_outage':
            return 'Major Outage';
        case 'maintenance':
            return 'Maintenance';
        default:
            return status;
    }
}

function showErrorState() {
    const statusGrid = document.getElementById('statusGrid');
    statusGrid.innerHTML = `
    <div class="status-error" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
      <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 1rem;"></i>
      <h3>Unable to load status data</h3>
      <p>We're having trouble loading the current system status. Please try again later.</p>
      <button onclick="fetchStatusData()" class="btn-accent mt-4">
        <i class="fas fa-sync-alt mr-2"></i>Retry
      </button>
    </div>
  `;
}