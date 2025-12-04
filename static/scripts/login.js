const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});


document.addEventListener('DOMContentLoaded', function() {
    const alert = document.getElementById('google-alert');
    if (alert) {
      setTimeout(function() {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.5s ease';
        setTimeout(function() {
          alert.remove();
        }, 500); // Remove from DOM after fade-out
      }, 5000); // Wait 5 seconds
    }
  });