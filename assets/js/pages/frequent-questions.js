document.addEventListener('DOMContentLoaded', function() {
    // Initialize the first category as active
    const defaultCategory = document.querySelector('.faq-category[data-category="general"]');
    if (defaultCategory) {
        defaultCategory.classList.add('active');
    }

    // Tab switching functionality
    const tabs = document.querySelectorAll('.faq-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and categories
            document.querySelectorAll('.faq-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.faq-category').forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Show the corresponding category
            const category = this.dataset.category;
            const activeCategory = document.querySelector(`.faq-category[data-category="${category}"]`);
            if (activeCategory) {
                activeCategory.classList.add('active');
            }
        });
    });
});