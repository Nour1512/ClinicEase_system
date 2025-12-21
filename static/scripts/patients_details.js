console.log("patients_details.js loaded");

// For update operations, ask for confirmation
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("patientForm");
    if (!form) {
        console.log("No patientForm found");
        return;
    }
    
    console.log("Form found, adding confirmation handler");
    console.log("Form action:", form.action);
    console.log("Form method:", form.method);
    
    form.addEventListener("submit", function (e) {
        console.log("Form submit triggered");
        
        if (form.action.includes("/update")) {
            console.log("This is an update, asking for confirmation");
            return confirm("Are you sure you want to update patient details?");
        }
        
        console.log("Form submission allowed");
        return true;
    });
});
