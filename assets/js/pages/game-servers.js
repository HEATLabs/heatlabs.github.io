// Configuration
const API_KEY = "ur2970048-6fecf47682aa739ab7f6be1b";
const API_URL = "https://api.uptimerobot.com/v2/getMonitors";
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Status mapping
const STATUS_MAP = {
    0: {
        text: "Paused",
        class: "status-paused"
    },
    1: {
        text: "Not checked yet",
        class: "status-unknown"
    },
    2: {
        text: "Up",
        class: "status-up"
    },
    8: {
        text: "Seems down",
        class: "status-down"
    },
    9: {
        text: "Down",
        class: "status-down"
    }
};

// Monitor type mapping
const TYPE_MAP = {
    1: "HTTP(s)",
    2: "Keyword",
    3: "Ping",
    4: "Port"
};

let refreshTimer = null;
let chartInstances = {};

// Get theme colors for charts
function getChartColors() {
    const isDarkTheme = document.documentElement.classList.contains('dark-theme');

    return {
        gridColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        tickColor: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
    };
}

// Format uptime ratio with appropriate color
function formatUptime(uptimeRatio) {
    if (!uptimeRatio || uptimeRatio === "" || uptimeRatio === "0") return "N/A";

    const uptimePercent = parseFloat(uptimeRatio);
    let uptimeClass = "uptime-low";

    if (uptimePercent >= 99.5) {
        uptimeClass = "uptime-high";
    } else if (uptimePercent >= 95.0) {
        uptimeClass = "uptime-medium";
    }

    return `<span class="uptime-value ${uptimeClass}">${uptimePercent.toFixed(2)}%</span>`;
}

// Format response time with appropriate color
function formatResponseTime(responseTime) {
    if (!responseTime) {
        return `<span class="response-value response-na">N/A</span>`;
    }

    let responseClass = "response-slow";

    if (responseTime < 100) {
        responseClass = "response-fast";
    } else if (responseTime < 500) {
        responseClass = "response-medium";
    }

    return `<span class="response-value ${responseClass}">${responseTime}ms</span>`;
}

// Format last check timestamp using the most recent log entry
function formatLastCheck(monitor) {
    // Check if we have logs and get the most recent one
    if (monitor.logs && monitor.logs.length > 0) {
        // Sort logs by datetime (newest first)
        const sortedLogs = [...monitor.logs].sort((a, b) => b.datetime - a.datetime);
        const lastLog = sortedLogs[0];

        if (lastLog && lastLog.datetime) {
            // Convert to milliseconds
            const timestampMs = lastLog.datetime < 10000000000 ? lastLog.datetime * 1000 : lastLog.datetime;
            const dt = new Date(timestampMs);

            // Check if date is valid
            if (isNaN(dt.getTime())) return "Never";

            return dt.toLocaleString();
        }
    }

    // Fallback to last_heartbeat if no logs available
    const timestamp = monitor.last_heartbeat || monitor.create_datetime;
    if (!timestamp || timestamp === 0) return "Never";

    // Convert to milliseconds
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const dt = new Date(timestampMs);

    // Check if date is valid
    if (isNaN(dt.getTime())) return "Never";

    return dt.toLocaleString();
}

// Format monitoring since date (when the monitor was created)
function formatMonitoringSince(timestamp) {
    if (!timestamp || timestamp === 0) return "Unknown";

    // Convert to milliseconds
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const dt = new Date(timestampMs);

    // Check if date is valid
    if (isNaN(dt.getTime())) return "Unknown";

    return dt.toLocaleDateString();
}

// Fetch monitors from Uptime Robot API using form data
async function fetchMonitors() {
    try {
        // Create form data instead of using headers
        const formData = new URLSearchParams();
        formData.append('api_key', API_KEY);
        formData.append('format', 'json');
        formData.append('logs', '1');
        formData.append('response_times', '1');
        formData.append('custom_uptime_ratios', '1-7-30');
        formData.append('response_times_limit', '24'); // Get 24 hours of data for charts

        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
            // Avoid CORS preflight
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.stat !== 'ok') {
            throw new Error(`API error: ${data.error?.message || 'Unknown error'}`);
        }

        return data;
    } catch (error) {
        console.error('Error fetching monitors:', error);
        throw error;
    }
}

// Create chart for a monitor
function createChart(monitorId, type, monitorData) {
    // Destroy existing chart if it exists
    if (chartInstances[monitorId]) {
        chartInstances[monitorId].destroy();
    }

    const ctx = document.getElementById(`chart-${monitorId}`);
    const placeholder = document.getElementById(`chart-placeholder-${monitorId}`);

    // If canvas doesn't exist, exit
    if (!ctx) return;

    const canvasContext = ctx.getContext('2d');

    // Get theme-specific colors
    const themeColors = getChartColors();

    // Check if we have data for the selected chart type
    const hasUptimeData = monitorData.logs && monitorData.logs.length > 0;
    const hasResponseTimeData = monitorData.response_times && monitorData.response_times.length > 0;

    // Show placeholder if no data available
    if ((type === 'uptime' && !hasUptimeData) || (type === 'response' && !hasResponseTimeData)) {
        if (ctx && placeholder) {
            ctx.style.display = 'none';
            placeholder.style.display = 'flex';

            // Update placeholder text based on chart type
            const placeholderText = placeholder.querySelector('.chart-placeholder-text');
            if (placeholderText) {
                placeholderText.textContent = type === 'uptime' ?
                    'No uptime data available' :
                    'No response time data available';
            }
        }
        return;
    }

    if (type === 'uptime') {
        // Create uptime chart
        const logs = monitorData.logs || [];
        const last24hLogs = logs
            .filter(log => {
                const logTime = new Date(log.datetime * 1000);
                const now = new Date();
                return (now - logTime) <= 24 * 60 * 60 * 1000;
            })
            .sort((a, b) => a.datetime - b.datetime);

        // Check if we have any logs after filtering
        if (last24hLogs.length === 0) {
            if (ctx && placeholder) {
                ctx.style.display = 'none';
                placeholder.style.display = 'flex';

                const placeholderText = placeholder.querySelector('.chart-placeholder-text');
                if (placeholderText) {
                    placeholderText.textContent = 'No uptime data available';
                }
            }
            return;
        }

        const data = last24hLogs.map(log => log.type === 1 ? 100 : 0); // 1 = up, 2 = down

        // Hide placeholder and show canvas
        if (ctx && placeholder) {
            ctx.style.display = 'block';
            placeholder.style.display = 'none';
        }

        chartInstances[monitorId] = new Chart(canvasContext, {
            type: 'line',
            data: {
                labels: Array(last24hLogs.length).fill(''),
                datasets: [{
                    label: 'Uptime Status',
                    data: data,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            color: themeColors.tickColor
                        },
                        grid: {
                            color: themeColors.gridColor
                        }
                    },
                    x: {
                        ticks: {
                            display: false,
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y === 100 ? 'Online' : 'Offline';
                            }
                        }
                    }
                }
            }
        });
    } else {
        // Create response time chart
        const responseTimes = monitorData.response_times || [];
        const last24hResponses = responseTimes
            .filter(rt => {
                const responseTime = new Date(rt.datetime * 1000);
                const now = new Date();
                return (now - responseTime) <= 24 * 60 * 60 * 1000;
            })
            .sort((a, b) => a.datetime - b.datetime);

        // Check if we have any response times after filtering
        if (last24hResponses.length === 0) {
            if (ctx && placeholder) {
                ctx.style.display = 'none';
                placeholder.style.display = 'flex';

                const placeholderText = placeholder.querySelector('.chart-placeholder-text');
                if (placeholderText) {
                    placeholderText.textContent = 'No response time data available for the last 24 hours';
                }
            }
            return;
        }

        const data = last24hResponses.map(rt => rt.value);

        // Hide placeholder and show canvas
        if (ctx && placeholder) {
            ctx.style.display = 'block';
            placeholder.style.display = 'none';
        }

        chartInstances[monitorId] = new Chart(canvasContext, {
            type: 'line',
            data: {
                labels: Array(last24hResponses.length).fill(''),
                datasets: [{
                    label: 'Response Time (ms)',
                    data: data,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + 'ms';
                            },
                            color: themeColors.tickColor
                        },
                        grid: {
                            color: themeColors.gridColor
                        }
                    },
                    x: {
                        ticks: {
                            display: false,
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Set up chart toggle buttons
function setupChartToggle(monitorId, monitorData) {
    const uptimeBtn = document.getElementById(`uptime-btn-${monitorId}`);
    const responseBtn = document.getElementById(`response-btn-${monitorId}`);

    if (!uptimeBtn || !responseBtn) return;

    uptimeBtn.addEventListener('click', () => {
        uptimeBtn.classList.add('active');
        responseBtn.classList.remove('active');
        createChart(monitorId, 'uptime', monitorData);
    });

    responseBtn.addEventListener('click', () => {
        responseBtn.classList.add('active');
        uptimeBtn.classList.remove('active');
        createChart(monitorId, 'response', monitorData);
    });

    // Initialize with response time chart
    responseBtn.classList.add('active');
    createChart(monitorId, 'response', monitorData);
}

// Display monitors
function displayMonitors(data) {
    const serversContainer = document.getElementById('serversContainer');

    if (!data || !data.monitors || data.monitors.length === 0) {
        serversContainer.innerHTML = `
            <div class="text-center py-5">
                <p>No monitors found or failed to load monitor data.</p>
            </div>
        `;
        return;
    }

    // Sort monitors by status (up first, then by name)
    const sortedMonitors = [...data.monitors].sort((a, b) => {
        if (a.status !== b.status) {
            // Up monitors first (status 2), then others
            return a.status === 2 ? -1 : b.status === 2 ? 1 : a.status - b.status;
        }
        return a.friendly_name.localeCompare(b.friendly_name);
    });

    let html = `<div class="servers-grid">`;

    sortedMonitors.forEach(monitor => {
        const statusInfo = STATUS_MAP[monitor.status] || {
            text: "Unknown",
            class: "status-unknown"
        };

        let uptimeRatio = monitor.all_time_uptime_ratio || monitor.custom_uptime_ratio || "0";
        const uptime = formatUptime(uptimeRatio);

        const lastCheck = formatLastCheck(monitor);
        const monitoringSince = formatMonitoringSince(monitor.create_datetime);

        // Get the latest response time
        let latestResponseTime = null;
        let responseTimeHtml = "";

        if (monitor.response_times && monitor.response_times.length > 0) {
            // Sort response times by datetime (newest first) and get the most recent
            const sortedResponseTimes = [...monitor.response_times].sort((a, b) => b.datetime - a.datetime);
            latestResponseTime = sortedResponseTimes[0].value;
        }

        // Format response time
        responseTimeHtml = formatResponseTime(latestResponseTime);

        // Get custom uptime ratios if available
        let customUptimeHtml = "";
        if (monitor.custom_uptime_ratios && monitor.custom_uptime_ratios.length > 0) {
            // Handle different API response formats
            let dailyUptime = "N/A";
            if (typeof monitor.custom_uptime_ratios === 'string') {
                // If its a string like "99.999-99.999-99.999"
                const ratios = monitor.custom_uptime_ratios.split('-');
                dailyUptime = ratios[0] || "N/A";
            } else if (Array.isArray(monitor.custom_uptime_ratios)) {
                // If its an array of objects
                const dailyRatio = monitor.custom_uptime_ratios.find(r => r.range === 1);
                dailyUptime = dailyRatio ? dailyRatio.ratio : "N/A";
            }

            customUptimeHtml = `<div class="server-detail">
                <span class="detail-label">24h Uptime:</span>
                <span class="detail-value">${formatUptime(dailyUptime)}</span>
            </div>`;
        }

        html += `
            <div class="server-card">
                <div class="server-header">
                    <h3 class="server-name">${monitor.friendly_name}</h3>
                    <span class="server-status ${statusInfo.class}">${statusInfo.text}</span>
                </div>

                <div class="server-details">
                    <div class="server-detail">
                        <span class="detail-label">Monitoring Since:</span>
                        <span class="detail-value">${monitoringSince}</span>
                    </div>

                    <div class="server-detail">
                        <span class="detail-label">Uptime:</span>
                        <span class="detail-value">${uptime}</span>
                    </div>

                    <div class="server-detail">
                        <span class="detail-label">Response Time:</span>
                        <span class="detail-value">${responseTimeHtml}</span>
                    </div>

                    ${customUptimeHtml}

                    <div class="server-detail">
                        <span class="detail-label">Last Check:</span>
                        <span class="detail-value">${lastCheck}</span>
                    </div>
                </div>

                <div class="chart-section">
                    <div class="chart-toggle-buttons">
                        <button id="uptime-btn-${monitor.id}" class="chart-toggle-btn">Uptime</button>
                        <button id="response-btn-${monitor.id}" class="chart-toggle-btn">Response Time</button>
                    </div>
                    <div class="chart-container">
                        <canvas id="chart-${monitor.id}"></canvas>
                        <div id="chart-placeholder-${monitor.id}" class="chart-placeholder">
                            <i class="fas fa-chart-line chart-placeholder-icon"></i>
                            <p class="chart-placeholder-text">No data available</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    serversContainer.innerHTML = html;

    // Update last updated timestamp
    document.getElementById('lastUpdated').textContent = `Last updated: ${new Date().toLocaleString()}`;

    // Set up chart toggles after DOM is updated
    setTimeout(() => {
        sortedMonitors.forEach(monitor => {
            setupChartToggle(monitor.id, monitor);
        });
    }, 100);
}

// Display error message
function displayError(error) {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <div>
                <strong>Failed to load server status:</strong> ${error.message || 'Unknown error'}
                <div>Please wait while we address this issue.</div>
            </div>
        </div>
    `;

    const serversContainer = document.getElementById('serversContainer');
    serversContainer.innerHTML = `
        <div class="text-center py-5">
            <p>Unable to load server data. Please try again later.</p>
            <button id="retryButton" class="refresh-button mt-3">
                <i class="fas fa-redo"></i>
                Try Again
            </button>
        </div>
    `;

    document.getElementById('retryButton').addEventListener('click', loadServerData);
}

// Clear any error messages
function clearError() {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.innerHTML = '';
}

// Load server data and update UI
async function loadServerData() {
    const refreshButton = document.getElementById('refreshButton');
    refreshButton.disabled = true;

    clearError();

    try {
        const data = await fetchMonitors();
        displayMonitors(data);
    } catch (error) {
        displayError(error);
    } finally {
        refreshButton.disabled = false;
    }
}

// Set up auto-refresh
function setupAutoRefresh() {
    const autoRefreshToggle = document.getElementById('autoRefreshToggle');

    // Load data initially
    loadServerData();

    // Set up refresh interval if auto-refresh is enabled
    if (autoRefreshToggle.checked) {
        refreshTimer = setInterval(loadServerData, REFRESH_INTERVAL);
    }

    // Toggle auto-refresh
    autoRefreshToggle.addEventListener('change', function() {
        if (this.checked) {
            refreshTimer = setInterval(loadServerData, REFRESH_INTERVAL);
        } else {
            if (refreshTimer) {
                clearInterval(refreshTimer);
                refreshTimer = null;
            }
        }
    });

    // Manual refresh button
    document.getElementById('refreshButton').addEventListener('click', loadServerData);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', setupAutoRefresh);