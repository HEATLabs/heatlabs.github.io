// Tankopedia Page JS
document.addEventListener('DOMContentLoaded', function() {
    // Fetch data
    async function fetchTankopediaData() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/main/tankopedia.json');
            if (!response.ok) {
                throw new Error('Failed to load tankopedia data');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading tankopedia data:', error);
            return [];
        }
    }

    // Create card HTML
    function createTankopediaCard(item) {
        const card = document.createElement('div');
        card.className = 'tankopedia-card';
        card.setAttribute('data-category', item.category);
        card.setAttribute('data-name', item.name);

        card.innerHTML = `
            <div class="tankopedia-img-container">
                <img src="${item.image}" alt="${item.name}" class="tankopedia-img" onerror="this.src='https://raw.githubusercontent.com/PCWStats/Website-Images/main/placeholder/placeholder-image.png'">
            </div>
            <div class="tankopedia-info">
                <h3>${item.name}</h3>
                <p>${item.description.substring(0, 60)}...</p>
            </div>
        `;

        // Add click event to open modal
        card.addEventListener('click', () => {
            openTankopediaModal(item);
        });

        return card;
    }

    // Render all cards (only one modal please, not 15)
    async function renderTankopediaCards() {
        const items = await fetchTankopediaData();
        const iconsSection = document.querySelector('#icons-section .tankopedia-grid');
        const camouflagesSection = document.querySelector('#camouflages-section .tankopedia-grid');

        iconsSection.innerHTML = '';
        camouflagesSection.innerHTML = '';

        if (!items || items.length === 0) {
            iconsSection.innerHTML = '<p class="text-center py-10">Failed to load tankopedia data. Please try again later.</p>';
            return;
        }

        // Create and append cards for each item
        items.forEach(item => {
            const card = createTankopediaCard(item);
            if (item.category === 'icon') {
                iconsSection.appendChild(card);
            } else if (item.category === 'camouflage') {
                camouflagesSection.appendChild(card);
            }
        });
    }

    // Initialize tab functionality
    function initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');

        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                // Hide all tab contents
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });

                // Show the selected tab content
                const tabId = this.getAttribute('data-tab');
                document.getElementById(`${tabId}-section`).classList.add('active');
            });
        });
    }

    // Initialize modal
    function initTankopediaModal() {
        const modalOverlay = document.getElementById('tankopediaModalOverlay');
        const modal = document.getElementById('tankopediaModal');
        const modalClose = document.getElementById('tankopediaModalClose');

        // Close modal handlers (fuck this shit)
        modalOverlay.addEventListener('click', closeTankopediaModal);
        modalClose.addEventListener('click', closeTankopediaModal);

        // Close with ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeTankopediaModal();
            }
        });
    }

    // Works
    function openTankopediaModal(item) {
        const modal = document.getElementById('tankopediaModal');
        const modalOverlay = document.getElementById('tankopediaModalOverlay');
        const modalImage = document.getElementById('tankopediaModalImage');
        const modalName = document.getElementById('tankopediaModalName');
        const modalCategory = document.getElementById('tankopediaModalCategory');
        const modalDescription = document.getElementById('tankopediaModalDescription');

        // Populate modal with item data
        modalImage.src = item.image;
        modalImage.alt = item.name;
        modalName.textContent = item.name;
        modalCategory.textContent = `Category: ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}`;
        modalDescription.textContent = item.description;

        // Show modal (does it tho?)
        modal.classList.add('active');
        modalOverlay.classList.add('active');  // Active my ass, might as well call this the first schrodinger's class, its both active and inactive at the same time
        document.body.style.overflow = 'hidden';
    }

    function closeTankopediaModal() {
        const modal = document.getElementById('tankopediaModal');
        const modalOverlay = document.getElementById('tankopediaModalOverlay');

        modal.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Initialize the page (please do)
    renderTankopediaCards();
    initTabs();
    initTankopediaModal();
});