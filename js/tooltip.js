document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips for all elements with data-tooltip attribute
    const tooltipElements = document.querySelectorAll('[data-tooltip]');

    tooltipElements.forEach(element => {
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';

        // Set tooltip content
        tooltip.textContent = element.getAttribute('data-tooltip');

        // Set position (default to top)
        const position = element.getAttribute('data-tooltip-pos') || 'top';
        tooltip.classList.add(position);

        // Create container if needed
        let container = element;
        if (!element.classList.contains('tooltip-container')) {
            container = document.createElement('div');
            container.className = 'tooltip-container';
            element.parentNode.insertBefore(container, element);
            container.appendChild(element);
        }
        container.appendChild(tooltip);

        // Add aria attributes for accessibility
        const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
        element.setAttribute('aria-describedby', tooltipId);
        tooltip.id = tooltipId;

        // Add mouse move event to follow cursor
        container.addEventListener('mousemove', function(e) {
            if (!tooltip.style.opacity || tooltip.style.opacity === '0') return;

            const offset = 10;
            let left, top;

            switch (position) {
                case 'top':
                    left = e.clientX;
                    top = e.clientY - offset;
                    tooltip.style.left = `${left}px`;
                    tooltip.style.top = `${top}px`;
                    tooltip.style.transform = `translateX(-50%) translateY(calc(-100% - ${offset}px))`;
                    break;
                case 'bottom':
                    left = e.clientX;
                    top = e.clientY + offset;
                    tooltip.style.left = `${left}px`;
                    tooltip.style.top = `${top}px`;
                    tooltip.style.transform = `translateX(-50%) translateY(${offset}px)`;
                    break;
                case 'left':
                    left = e.clientX - offset;
                    top = e.clientY;
                    tooltip.style.left = `${left}px`;
                    tooltip.style.top = `${top}px`;
                    tooltip.style.transform = `translateX(calc(-100% - ${offset}px)) translateY(-50%)`;
                    break;
                case 'right':
                    left = e.clientX + offset;
                    top = e.clientY;
                    tooltip.style.left = `${left}px`;
                    tooltip.style.top = `${top}px`;
                    tooltip.style.transform = `translateX(${offset}px) translateY(-50%)`;
                    break;
            }
        });

        // Reset position when mouse leaves
        container.addEventListener('mouseleave', function() {
            tooltip.style.left = '';
            tooltip.style.top = '';
        });
    });
});