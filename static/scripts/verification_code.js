// Auto-focus first input
document.querySelector('.otp-input').focus();

const inputs = document.querySelectorAll('.otp-input');
const fullCodeInput = document.getElementById('full-code');

function updateFullCode() {
    const code = Array.from(inputs).map(input => input.value).join('');
    fullCodeInput.value = code;
}

inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9]/g, '');
        updateFullCode();
        if (input.value && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

// Optional: Validate on submit
document.querySelector('form').addEventListener('submit', (e) => {
    if (fullCodeInput.value.length !== 6) {
        e.preventDefault();
        alert('Please enter a 6-digit code');
    }
});

// Resend handler
document.getElementById('resendBtn').addEventListener('click', () => {
    const email = document.querySelector('[name="email"]').value;
    if (!email) {
        alert('Email not found');
        return;
    }
    
    // Optional: Call your resend API here
    alert(`Resending code to ${email}`);
    inputs.forEach(input => input.value = '');
    fullCodeInput.value = '';
    inputs[0].focus();
});