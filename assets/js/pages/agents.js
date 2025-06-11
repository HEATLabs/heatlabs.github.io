// Function to fetch agents data
async function fetchAgentsData() {
    try {
        const response = await fetch('../Website-Configs/agents.json');
        if (!response.ok) {
            throw new Error('Failed to load agents data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading agents data:', error);
        return {
            agents: []
        };
    }
}

// Function to render agents grid
function renderAgentsGrid(agents) {
    const agentsGrid = document.getElementById('agents-grid');

    // Sort agents alphabetically by name
    const sortedAgents = [...agents].sort((a, b) => a.name.localeCompare(b.name));

    agentsGrid.innerHTML = sortedAgents.map(agent => `
        <div class="agent-card" data-agent-name="${agent.name}">
            <div class="agent-img-container">
                <img src="${agent.image}" alt="${agent.name}" class="agent-img">
            </div>
            <div class="agent-info">
                <h3>${agent.name}</h3>
                <p class="agent-specialty">${agent.specialty}</p>
                <div class="agent-meta">
                    <i class="fas fa-tank"></i>
                    <span>${agent.compatibleTanks.length} Compatible Tank${agent.compatibleTanks.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Add click event listeners to all agent cards
    document.querySelectorAll('.agent-card').forEach(card => {
        card.addEventListener('click', () => {
            const agentName = card.getAttribute('data-agent-name');
            const agent = agents.find(a => a.name === agentName);
            if (agent) {
                openAgentModal(agent);
            }
        });
    });
}

// Function to open agent modal
function openAgentModal(agent) {
    const modalOverlay = document.getElementById('agentModalOverlay');
    const modal = document.getElementById('agentModal');

    // Set modal content
    document.getElementById('agentModalImage').src = agent.image;
    document.getElementById('agentModalImage').alt = agent.name;
    document.getElementById('agentModalName').textContent = agent.name;
    document.getElementById('agentModalSpecialty').textContent = `Specialty: ${agent.specialty}`;
    document.getElementById('agentModalDescription').textContent = agent.description;
    document.getElementById('agentModalStory').textContent = agent.story;

    // Render compatible tanks
    const tanksContainer = document.getElementById('agentModalTanksContainer');
    tanksContainer.innerHTML = agent.compatibleTanks.map(tank => `
        <a href="tanks/${tank.slug}.html" class="agent-modal-tank">
            <img src="${tank.image}" alt="${tank.name}" loading="lazy">
            <span>${tank.name}</span>
        </a>
    `).join('');

    // Show modal
    modalOverlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Scroll to top of modal
    modal.scrollTo(0, 0);
}

// Function to close agent modal
function closeAgentModal() {
    const modalOverlay = document.getElementById('agentModalOverlay');
    const modal = document.getElementById('agentModal');

    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Load agents data
    const agentsData = await fetchAgentsData();
    renderAgentsGrid(agentsData.agents);

    // Set up modal close button
    document.getElementById('agentModalClose').addEventListener('click', closeAgentModal);
    document.getElementById('agentModalOverlay').addEventListener('click', closeAgentModal);

    // Prevent modal from closing when clicking inside it
    document.getElementById('agentModal').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('agentModal').classList.contains('active')) {
            closeAgentModal();
        }
    });
});