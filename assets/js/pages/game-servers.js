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

// Format last check timestamp
function formatLastCheck(timestamp) {
    if (!timestamp || timestamp === 0) return "Never";

    // Convert to milliseconds
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const dt = new Date(timestampMs);

    // Check if date is valid
    if (isNaN(dt.getTime())) return "Never";

    return dt.toLocaleString();
}

// Format response time with appropriate color
function formatResponseTime(responseTime) {
    if (!responseTime) {
        return `
            <div class="response-bar">
                <div class="response-fill response-na" style="width: 100%"></div>
            </div>
            <div class="response-info">
                <span>Response Time</span>
                <span>N/A</span>
            </div>
        `;
    }

    let responseClass = "response-slow";
    let width = Math.min(100, responseTime / 10);

    if (responseTime < 100) {
        responseClass = "response-fast";
    } else if (responseTime < 500) {
        responseClass = "response-medium";
    }

    return `
        <div class="response-bar">
            <div class="response-fill ${responseClass}" style="width: ${width}%"></div>
        </div>
        <div class="response-info">
            <span>Response Time</span>
            <span>${responseTime}ms</span>
        </div>
    `;
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

        const lastCheckTimestamp = monitor.last_heartbeat || monitor.create_datetime;
        const lastCheck = formatLastCheck(lastCheckTimestamp);

        // Get average response time from recent data
        let avgResponseTime = null;
        let responseTimeHtml = "";

        if (monitor.response_times && monitor.response_times.length > 0) {
            // Calculate average of last 10 response times
            const recentResponses = monitor.response_times.slice(-10);
            const sum = recentResponses.reduce((total, rt) => total + rt.value, 0);
            avgResponseTime = Math.round(sum / recentResponses.length);
        }

        // Always show response time section, even if no data
        responseTimeHtml = formatResponseTime(avgResponseTime);

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
                        <span class="detail-label">Uptime:</span>
                        <span class="detail-value">${uptime}</span>
                    </div>

                    ${customUptimeHtml}

                    <div class="server-detail">
                        <span class="detail-label">Last Check:</span>
                        <span class="detail-value">${lastCheck}</span>
                    </div>
                </div>

                <div class="server-response">${responseTimeHtml}</div>
            </div>
        `;
    });

    html += `</div>`;
    serversContainer.innerHTML = html;

    // Update last updated timestamp
    document.getElementById('lastUpdated').textContent = `Last updated: ${new Date().toLocaleString()}`;
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