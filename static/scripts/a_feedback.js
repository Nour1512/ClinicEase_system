// a_feedback.js

document.addEventListener('DOMContentLoaded', function() {
    // 1. Select All Checkbox
    const selectAllCheckbox = document.getElementById('select-all');
    const rowCheckboxes = document.querySelectorAll('.table-row input[type="checkbox"]');

    selectAllCheckbox.addEventListener('change', function() {
        rowCheckboxes.forEach(cb => cb.checked = this.checked);
    });

    // 2. Single Row Checkbox (Update Select All)
    rowCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            const allChecked = Array.from(rowCheckboxes).every(cb => cb.checked);
            const anyChecked = Array.from(rowCheckboxes).some(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = anyChecked && !allChecked;
        });
    });

    // 3. Sort Headers (Dummy Functionality)
    const sortHeaders = document.querySelectorAll('.sort-header');
    sortHeaders.forEach(header => {
        header.addEventListener('click', function() {
            
            console.log(`Sorting by: ${this.textContent.trim().split(' ')[0]}`);
          
            const arrow = this.querySelector('.sort-arrow');
            if (arrow) {
                arrow.textContent = arrow.textContent === '↑↓' ? '↓↑' : '↑↓';
            }
        });
    });

    // 4. Bulk Actions Dropdown
    const bulkActionSelect = document.querySelector('.bulk-actions .filter-select');
    const applyButton = document.querySelector('.bulk-actions .btn-secondary');

    applyButton.addEventListener('click', function() {
        const selectedAction = bulkActionSelect.value;
        if (selectedAction !== 'Bulk actions') {
            const selectedRows = Array.from(rowCheckboxes).filter(cb => cb.checked).length;
            if (selectedRows > 0) {
                showToast(`Applied "${selectedAction}" to ${selectedRows} item(s).`);
            } else {
                showToast("Please select at least one item.");
            }
        }
    });

    // 5. Filter Button
    const filterButton = document.querySelector('.filter-group .btn-secondary');
    filterButton.addEventListener('click', function() {
        showToast("Filters applied!");
    });

    // 6. Pagination Buttons
    const paginationButtons = document.querySelectorAll('.pagination-controls .btn-round');
    paginationButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('current-page')) {
              
                paginationButtons.forEach(b => b.classList.remove('current-page'));
             
                this.classList.add('current-page');
                showToast("Page changed!");
            }
        });
    });

    // 7. Toast Notification Function
    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        toast.textContent = message;
        toast.classList.add('visible');

        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }

    // 8. Search Input Focus
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('focus', function() {
        this.parentElement.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.2)';
    });

    searchInput.addEventListener('blur', function() {
        this.parentElement.style.boxShadow = 'none';
    });

 
});