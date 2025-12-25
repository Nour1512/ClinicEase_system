// ============================================
// Application State
// ============================================
const AppState = {
    patientName: '',
    gender: null,
    ratings: {
        doctor_knowledge: null,
        doctor_kindness: null,
        nurse_patience: null,
        nurse_knowledge: null,
        waiting_time: null,
        hygiene: null
    },
    improvementSuggestions: ''
};

// ============================================
// DOM Elements
// ============================================
const patientNameInput = document.getElementById('patientName');
const genderToggle = document.getElementById('genderToggle');
const genderDropdown = document.getElementById('genderDropdown');
const genderOptions = document.querySelectorAll('.gender-option');
const ratingOptions = document.querySelectorAll('.rating-option');
const improvementTextarea = document.getElementById('improvementTextarea');
const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
const exportBtn = document.getElementById('exportBtn'); // الزرار في صفحة المريض
const resetBtn = document.getElementById('resetBtn'); 
const feedbackForm = document.getElementById('feedbackForm');
const toast = document.getElementById('toast');

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    validateForm();
});

function initEventListeners() {
    // Name Input
    if(patientNameInput) {
        patientNameInput.addEventListener('input', e => {
            AppState.patientName = e.target.value.trim();
            validateForm();
        });
    }

    // Gender Toggle
    if(genderToggle) {
        genderToggle.addEventListener('click', () => {
            genderDropdown.classList.toggle('show');
        });
    }

    genderOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectGender(option.dataset.value, option.textContent);
        });
    });

    // Ratings
    ratingOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectRating(option.dataset.category, parseInt(option.dataset.rating), option);
        });
    });

    // Submit & Reset & Export
    if(submitFeedbackBtn) submitFeedbackBtn.addEventListener('click', submitFeedback);
    if(resetBtn) resetBtn.addEventListener('click', handleReset);
    if(exportBtn) exportBtn.addEventListener('click', exportPatientData);

    // Close Dropdown on click outside
    document.addEventListener('click', e => {
        if (genderToggle && !genderToggle.contains(e.target) && !genderDropdown.contains(e.target)) {
            genderDropdown.classList.remove('show');
        }
    });
}

// ============================================
// Functions
// ============================================

function selectGender(value, text) {
    AppState.gender = value;
    genderToggle.querySelector('span').textContent = text;
    genderDropdown.classList.remove('show');
    validateForm();
}

function selectRating(category, rating, element) {
    AppState.ratings[category] = rating;
    document.querySelectorAll(`.rating-option[data-category="${category}"] .rating-circle`)
            .forEach(c => c.classList.remove('selected'));
    element.querySelector('.rating-circle').classList.add('selected');
    validateForm();
}

function validateForm() {
    if(!submitFeedbackBtn) return;
    let valid = true;
    if (!AppState.patientName || AppState.patientName.length < 2) valid = false;
    if (!AppState.gender) valid = false;
    if (!Object.values(AppState.ratings).every(r => r !== null)) valid = false;

    submitFeedbackBtn.disabled = !valid;
    submitFeedbackBtn.style.opacity = valid ? '1' : '0.6';
    return valid;
}

// زرار الـ Reset
function handleReset() {
    if (confirm('Are you sure you want to clear the form?')) {
        if(feedbackForm) feedbackForm.reset();
        resetAppState();
        showToast('Form cleared', 'info');
    }
}

function resetAppState() {
    AppState.patientName = '';
    AppState.gender = null;
    AppState.improvementSuggestions = '';
    AppState.ratings = {
        doctor_knowledge: null, doctor_kindness: null,
        nurse_patience: null, nurse_knowledge: null,
        waiting_time: null, hygiene: null
    };
    if(genderToggle) genderToggle.querySelector('span').textContent = 'Please Select';
    document.querySelectorAll('.rating-circle').forEach(c => c.classList.remove('selected'));
    validateForm();
}

// زرار الـ Export (المخصص لبيانات المريض الحالية)
function exportPatientData() {
    const data = [{
        Patient: AppState.patientName,
        Gender: AppState.gender,
        ...AppState.ratings,
        Suggestions: AppState.improvementSuggestions
    }];

    const headers = Object.keys(data[0]);
    const csvContent = "\ufeff" + [
        headers.join(','),
        data.map(row => headers.map(header => `"${row[header] || ''}"`).join(',')).join('\n')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `my_feedback.csv`;
    link.click();
}

async function submitFeedback() {
    const ratings = Object.values(AppState.ratings);
    const overallRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);

    const feedbackData = {
        patient_name: AppState.patientName,
        gender: AppState.gender,
        ...AppState.ratings,
        improvement_suggestions: improvementTextarea.value,
        overall_rating: parseFloat(overallRating),
        submission_date: new Date().toISOString().split('T')[0],
        status: 'pending'
    };

    try {
        const response = await fetch('/api/patient/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackData)
        });
        const result = await response.json();
        if (result.success) {
            showToast('Feedback submitted successfully', 'success');
            resetAppState();
        }
    } catch (err) {
        showToast('Submit failed', 'error');
    }
}

function showToast(msg, type = 'info') {
    if(!toast) return;
    toast.textContent = msg;
    toast.className = `toast ${type} visible`;
    setTimeout(() => toast.classList.remove('visible'), 3000);
}