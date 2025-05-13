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
    fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/changelog.json')
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
    versionContainer.className = 'version-info mt-4';

    // Format the date
    const formattedDate = formatDate(update.date);

    // Create the version text with link
    const versionLink = document.createElement('a');
    versionLink.href = 'https://pcwstats.github.io/changelog.html';
    versionLink.className = 'text-gray-400 hover:text-accent-color transition-colors';
    versionLink.title = 'View full changelog';

    if (isFallback) {
        versionLink.innerHTML = `
            <span class="font-medium">Version</span>: v${update.version}
            <span class="opacity-75">(offline)</span>
        `;
    } else {
        versionLink.innerHTML = `
            <span class="font-medium">Latest version</span>: v${update.version}
            <span class="opacity-75">(${formattedDate})</span>
        `;
    }

    // Add click event to scroll to top when going to changelog
    versionLink.addEventListener('click', function(e) {
        // Only prevent default if we're not falling back
        if (!isFallback) {
            e.preventDefault();
            window.location.href = 'https://pcwstats.github.io/changelog.html';
            window.scrollTo(0, 0);
        }
    });

    versionContainer.appendChild(versionLink);
    disclaimerDiv.appendChild(versionContainer);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}