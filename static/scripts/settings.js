// =============================
// SETTINGS.JS — FULL WORKING FILE
// =============================

// ------ ELEMENT SELECTORS ------
const settingsForm = document.getElementById("settingsForm");
const uploadInput = document.getElementById("uploadInput");
const profileImage = document.getElementById("profileImage");

// -------------------------------
//  IMAGE UPLOAD + LIVE PREVIEW
// -------------------------------
uploadInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        profileImage.src = reader.result;
    };
    reader.readAsDataURL(file);
});

// -------------------------------
//  TOAST SYSTEM
// -------------------------------
function showToast(message) {
    let toast = document.getElementById("customToast");

    // Create toast container if not already existing
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "customToast";
        toast.style.position = "fixed";
        toast.style.bottom = "25px";
        toast.style.right = "25px";
        toast.style.background = "#333";
        toast.style.color = "#fff";
        toast.style.padding = "14px 22px";
        toast.style.borderRadius = "6px";
        toast.style.fontSize = "15px";
        toast.style.opacity = "0";
        toast.style.transition = "0.5s";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
    }, 3000);
}

// -------------------------------
//  SAVE CHANGES FUNCTION
// -------------------------------
async function saveChanges() {

    // Retrieve form fields
    const inputs = settingsForm.querySelectorAll("input, select");

    let formData = {};

    inputs.forEach(input => {
        const label = input.previousElementSibling?.innerText || "field";
        const name = input.placeholder || label; // fallback
        formData[name.replace(/\s+/g, "_").toLowerCase()] = input.value;
    });

    // If profile image was changed, attach it as base64
    if (uploadInput.files.length > 0) {
        formData["profile_image"] = profileImage.src;
    }

    try {
        const response = await fetch("/settings/api/update_all", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
            showToast(data.error || "Update failed");
            return;
        }

        showToast("Changes saved successfully!");

    } catch (err) {
        console.error(err);
        showToast("Network error");
    }
}
