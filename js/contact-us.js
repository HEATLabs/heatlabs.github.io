// Now you see me now you dont type script
document.addEventListener('DOMContentLoaded', function() {
    // Get all option cards and select buttons
    const optionCards = document.querySelectorAll('.option-card:not(.other-option)');
    const selectButtons = document.querySelectorAll('.option-card:not(.other-option) .option-select-btn');
    const backToOptionsButtons = document.querySelectorAll('.back-to-options');

    // Get all containers
    const contactOptions = document.getElementById('contactOptions');
    const generalFormContainer = document.getElementById('generalFormContainer');
    const tankFormContainer = document.getElementById('tankFormContainer');
    const mapFormContainer = document.getElementById('mapFormContainer');
    const involvedFormContainer = document.getElementById('involvedFormContainer');

    // Add click event listeners to all select buttons
    selectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const optionCard = this.closest('.option-card');
            const optionType = optionCard.dataset.option;

            // Hide the options container
            contactOptions.classList.add('hidden');

            // Hide all form containers first
            generalFormContainer.classList.remove('active');
            generalFormContainer.classList.add('hidden');
            tankFormContainer.classList.remove('active');
            tankFormContainer.classList.add('hidden');
            mapFormContainer.classList.remove('active');
            mapFormContainer.classList.add('hidden');
            involvedFormContainer.classList.remove('active');
            involvedFormContainer.classList.add('hidden');

            // Show the selected form container
            switch (optionType) {
                case 'general':
                    generalFormContainer.classList.remove('hidden');
                    generalFormContainer.classList.add('active');
                    break;
                case 'tank':
                    tankFormContainer.classList.remove('hidden');
                    tankFormContainer.classList.add('active');
                    break;
                case 'map':
                    mapFormContainer.classList.remove('hidden');
                    mapFormContainer.classList.add('active');
                    break;
                case 'involved':
                    involvedFormContainer.classList.remove('hidden');
                    involvedFormContainer.classList.add('active');
                    break;
            }

            // Scroll to the form container
            document.getElementById('main').scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add click event listeners to all back buttons
    backToOptionsButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Hide all form containers
            generalFormContainer.classList.remove('active');
            generalFormContainer.classList.add('hidden');
            tankFormContainer.classList.remove('active');
            tankFormContainer.classList.add('hidden');
            mapFormContainer.classList.remove('active');
            mapFormContainer.classList.add('hidden');
            involvedFormContainer.classList.remove('active');
            involvedFormContainer.classList.add('hidden');

            // Show the options container
            contactOptions.classList.remove('hidden');

            // Scroll to the options container
            document.getElementById('main').scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add hover effects to option cards
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
});