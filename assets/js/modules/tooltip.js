document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips for all elements with data-tooltip attribute
    const initializeTooltips = () => {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            // Skip if already initialized
            if (element.hasAttribute('data-tooltip-initialized')) return;

            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.getAttribute('data-tooltip');

            // Set position (default to top)
            const position = element.getAttribute('data-tooltip-pos') || 'top';
            tooltip.classList.add(position);

            // Create container if needed
            let container = element;
            if (!element.closest('.tooltip-container')) {
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
            element.setAttribute('data-tooltip-initialized', 'true');

            // Add mouse events
            container.addEventListener('mouseenter', function() {
                tooltip.style.opacity = '1';
                updateTooltipPosition(container, tooltip, position);
            });

            container.addEventListener('mouseleave', function() {
                tooltip.style.opacity = '0';
            });

            container.addEventListener('mousemove', function(e) {
                updateTooltipPosition(container, tooltip, position, e);
            });
        });
    };

    // Position the tooltip relative to the element
    const updateTooltipPosition = (container, tooltip, position, event = null) => {
        const containerRect = container.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const offset = 10;

        let left, top;

        if (event) {
            // Follow cursor if event is provided
            switch (position) {
                case 'top':
                    left = event.clientX;
                    top = event.clientY - offset;
                    tooltip.style.transform = `translateX(-50%) translateY(calc(-100% - ${offset}px))`;
                    break;
                case 'bottom':
                    left = event.clientX;
                    top = event.clientY + offset;
                    tooltip.style.transform = `translateX(-50%) translateY(${offset}px)`;
                    break;
                case 'left':
                    left = event.clientX - offset;
                    top = event.clientY;
                    tooltip.style.transform = `translateX(calc(-100% - ${offset}px)) translateY(-50%)`;
                    break;
                case 'right':
                    left = event.clientX + offset;
                    top = event.clientY;
                    tooltip.style.transform = `translateX(${offset}px) translateY(-50%)`;
                    break;
            }
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        } else {
            // Position relative to element
            switch (position) {
                case 'top':
                    left = containerRect.left + containerRect.width / 2;
                    top = containerRect.top - offset;
                    tooltip.style.transform = `translateX(-50%) translateY(calc(-100% - ${offset}px))`;
                    break;
                case 'bottom':
                    left = containerRect.left + containerRect.width / 2;
                    top = containerRect.bottom + offset;
                    tooltip.style.transform = `translateX(-50%) translateY(${offset}px)`;
                    break;
                case 'left':
                    left = containerRect.left - offset;
                    top = containerRect.top + containerRect.height / 2;
                    tooltip.style.transform = `translateX(calc(-100% - ${offset}px)) translateY(-50%)`;
                    break;
                case 'right':
                    left = containerRect.right + offset;
                    top = containerRect.top + containerRect.height / 2;
                    tooltip.style.transform = `translateX(${offset}px) translateY(-50%)`;
                    break;
            }
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        }
    };

    // Initialize tooltips on load
    initializeTooltips();

    // MutationObserver to handle dynamically added content
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                initializeTooltips();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});