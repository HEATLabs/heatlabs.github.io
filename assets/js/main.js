// Main JS for PCWStats
document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Initialize interactive elements
    initializeInteractiveElements();

    // Fetch changelog data from GitHub
    fetch('https://cdn.jsdelivr.net/gh/PCWStats/Website-Configs@main/changelog.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.updates && data.updates.length > 0) {
                // Get the latest update (first item in the array)
                const latestUpdate = data.updates[0];
                addVersionToFooter(latestUpdate);
            }
        })
        .catch(error => {
            console.error('Error fetching version information:', error);
            // Fallback version display if the fetch fails
            addVersionToFooter({
                version: '1.0.0',
                date: new Date().toISOString().split('T')[0]
            }, true);
        });
});

function initializeInteractiveElements() {
    // Add animation to feature cards and tank cards when they come into view
    const featureCards = document.querySelectorAll('.feature-card');
    const tankCards = document.querySelectorAll('.tank-card');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        featureCards.forEach(card => {
            observer.observe(card);
        });

        tankCards.forEach(card => {
            observer.observe(card);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        featureCards.forEach(card => {
            card.classList.add('animated');
        });
        tankCards.forEach(card => {
            card.classList.add('animated');
        });
    }
}

function addVersionToFooter(update, isFallback = false) {
    // Find the footer disclaimer div (the one that contains the copyright info)
    const disclaimerDiv = document.querySelector('.footer .text-center.text-sm.text-gray-500');

    if (!disclaimerDiv) {
        console.warn('Could not find footer disclaimer div');
        return;
    }

    // Create a container for the version info
    const versionContainer = document.createElement('div');
    versionContainer.className = 'version-info-container';

    // Format the date
    const formattedDate = formatDate(update.date);
    const currentDate = formatDate(new Date().toISOString().split('T')[0]);

    // Create version info element
    const versionInfo = document.createElement('div');
    versionInfo.className = 'version-info-item';
    versionInfo.innerHTML = `
        <span class="version-label">Version:</span>
        <span class="version-value">v${update.version}</span>
    `;

    // Create last updated element
    const updatedInfo = document.createElement('div');
    updatedInfo.className = 'version-info-item';
    updatedInfo.innerHTML = `
        <span class="version-label">Last Updated:</span>
        <span class="version-value">${isFallback ? currentDate : formattedDate}</span>
    `;

    // Create changelog link
    const changelogLink = document.createElement('a');
    changelogLink.className = 'version-info-item version-info-link';
    changelogLink.href = 'https://pcwstats.github.io/resources/changelog.html';
    changelogLink.innerHTML = `
        <span>View Changelog</span>
        <i class="fas fa-external-link-alt"></i>
    `;
    changelogLink.title = 'View full changelog';
    changelogLink.target = '_blank';
    changelogLink.rel = 'noopener noreferrer';

    // Append all elements to container
    versionContainer.appendChild(versionInfo);
    versionContainer.appendChild(updatedInfo);
    versionContainer.appendChild(changelogLink);

    // Insert after disclaimer
    disclaimerDiv.parentNode.insertBefore(versionContainer, disclaimerDiv.nextSibling);
}

function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}