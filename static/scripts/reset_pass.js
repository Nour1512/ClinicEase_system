const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const bar = document.querySelector("#strengthBar .bar");
const strengthText = document.getElementById("strengthText");
const form = document.getElementById("resetForm");

password.addEventListener("input", updateStrength);

function updateStrength() {
    const value = password.value;
    let strength = 0;

    if (value.length > 6) strength++;
    if (value.match(/[A-Z]/)) strength++;
    if (value.match(/[0-9]/)) strength++;
    if (value.match(/[^A-Za-z0-9]/)) strength++;

    switch (strength) {
        case 0:
        case 1:
            bar.style.width = "25%";
            bar.style.background = "red";
            strengthText.textContent = "Password strength: Weak";
            break;
        case 2:
            bar.style.width = "50%";
            bar.style.background = "orange";
            strengthText.textContent = "Password strength: Fair";
            break;
        case 3:
            bar.style.width = "75%";
            bar.style.background = "#72cc4a";
            strengthText.textContent = "Password strength: Good";
            break;
        case 4:
            bar.style.width = "100%";
            bar.style.background = "#21c162";
            strengthText.textContent = "Password strength: Excellent";
            break;
    }
}


function togglePassword(id, iconWrapper) {
    const field = document.getElementById(id);
    const icon = iconWrapper.querySelector("img");

    if (field.type === "password") {
        field.type = "text";
        icon.src = "https://cdn-icons-png.flaticon.com/512/565/565655.png"; // closed eye
    } else {
        field.type = "password";
        icon.src = "https://cdn-icons-png.flaticon.com/512/159/159604.png"; // open eye
    }
}

form.addEventListener("submit", function (e) {

    if (password.value !== confirmPassword.value) {
        e.preventDefault();
        alert("Passwords do not match!");
        return;
    }

    // alert("Password successfully reset!");

    // redirect after success
    // window.location.href = "pass_changed.html";
});
