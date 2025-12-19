document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', function() {
        this.style.borderColor = '#4f46e5';
        this.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
    });
    
    input.addEventListener('blur', function() {
        this.style.borderColor = '#e5e7eb';
        this.style.boxShadow = 'none';
    });
});

// Auto-focus first field
document.addEventListener('DOMContentLoaded', function() {
    const firstInput = document.querySelector('.form-control');
    if (firstInput) {
        firstInput.focus();
    }
});

// Show success message after form submission
document.querySelector('.completion-form')?.addEventListener('submit', function(e) {
    const submitBtn = e.target.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
});