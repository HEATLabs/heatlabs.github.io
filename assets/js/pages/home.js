// home.js - Fun Facts Counter Animation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize counters
    initializeCounters();

    // Calculate and display days since creation and coffee cups
    calculateDaysAndCoffee();
});

function initializeCounters() {
    const counters = document.querySelectorAll('.fun-fact-number[data-count]');
    const speed = 200; // The lower the faster
    let animationComplete = true;

    counters.forEach(counter => {
        // Skip the coffee cups counter since we'll calculate it separately
        if (counter.parentElement.querySelector('.fun-fact-label').textContent.includes('Coffee Cups')) {
            return;
        }

        const target = +counter.getAttribute('data-count');
        const currentText = counter.innerText;
        let currentCount = parseFloat(currentText.replace(/[^0-9.]/g, '')) || 0;

        const isLinesOfCode = counter.parentElement.querySelector('.fun-fact-label').textContent.includes('Lines of Code');

        if (currentCount < target) {
            animationComplete = false;
            const increment = Math.max(1, target / speed);
            let newCount = Math.min(currentCount + increment, target);

            if (isLinesOfCode) {
                // For lines of code, we show raw numbers during animation
                counter.innerText = Math.floor(newCount).toLocaleString();
            } else {
                counter.innerText = Math.floor(newCount);
            }
        } else if (isLinesOfCode && !currentText.includes('M')) {
            // For the "lines of code" counter, add "M" after animation completes
            counter.innerText = (target / 1000000).toFixed(2) + 'M';
        }
    });

    if (!animationComplete) {
        requestAnimationFrame(initializeCounters);
    }
}

function calculateDaysAndCoffee() {
    const creationDate = new Date('April 24, 2025 00:00:00');
    const today = new Date();
    const diffTime = today - creationDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const coffeeCups = diffDays * 11; // 11 cups per day

    // Animate the days counter
    const daysCounter = document.getElementById('days-since-creation');
    animateValue(daysCounter, 0, diffDays, 2000);

    // Find and animate the coffee cups counter
    const coffeeCupsElements = document.querySelectorAll('.fun-fact-item');
    coffeeCupsElements.forEach(item => {
        if (item.querySelector('.fun-fact-label').textContent.includes('Coffee Cups')) {
            const coffeeCounter = item.querySelector('.fun-fact-number');
            animateValue(coffeeCounter, 0, coffeeCups, 2000);
        }
    });
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}