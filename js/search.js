document.addEventListener('DOMContentLoaded', function() {
    const openSearchBtn = document.getElementById('openSearch');
    const searchModal = document.getElementById('searchModal');
    const searchOverlay = document.getElementById('searchOverlay');

    // Open search modal
    openSearchBtn.addEventListener('click', function() {
        searchModal.classList.add('open');
        searchOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.querySelector('.search-modal-input').focus();
    });

    // Close search modal
    function closeSearch() {
        searchModal.classList.remove('open');
        searchOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Close when clicking on overlay
    searchOverlay.addEventListener('click', closeSearch);

    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchModal.classList.contains('open')) {
            closeSearch();
        }
    });

    // Example search tag click handler
    // Complete search functionality will be added later
    const searchTags = document.querySelectorAll('.search-tag');
    searchTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const searchInput = document.querySelector('.search-modal-input');
            searchInput.value = this.textContent;
            searchInput.focus();
        });
    });
});