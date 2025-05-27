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

    counters.forEach(counter => {
        // Skip the coffee cups counter since we'll calculate it separately
        if (counter.parentElement.querySelector('.fun-fact-label').textContent.includes('Coffee Cups')) {
            return;
        }

        const target = +counter.getAttribute('data-count');
        const count = +counter.innerText;
        const increment = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(initializeCounters, 1);
        } else {
            // For the "lines of code" counter, add "k" after animation completes
            if (counter.parentElement.querySelector('.fun-fact-label').textContent.includes('Lines of Code')) {
                counter.innerText = target + 'k';
            } else {
                counter.innerText = target;
            }
        }
    });
}

function calculateDaysAndCoffee() {
    const creationDate = new Date('April 24, 2025 00:00:00');
    const today = new Date();
    const diffTime = today - creationDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const coffeeCups = diffDays * 9; // 9 cups per day

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