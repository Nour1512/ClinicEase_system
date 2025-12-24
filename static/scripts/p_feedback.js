// ============================================
// Patient Feedback Application
// ============================================

// Application State
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

// DOM Elements
const patientNameInput = document.getElementById('patientName');
const genderToggle = document.getElementById('genderToggle');
const genderDropdown = document.getElementById('genderDropdown');
const genderOptions = document.querySelectorAll('.gender-option');
const ratingOptions = document.querySelectorAll('.rating-option');
const improvementTextarea = document.getElementById('improvementTextarea');
const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
const exportBtn = document.getElementById('exportBtn');
const aiAnalysisBtn = document.getElementById('aiAnalysisBtn');
const toast = document.getElementById('toast');

// ============================================
// Init
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    validateForm();
});

// ============================================
// Event Listeners
// ============================================
function initEventListeners() {
    patientNameInput.addEventListener('input', e => {
        AppState.patientName = e.target.value.trim();
        validateForm();
    });

    genderToggle.addEventListener('click', () => {
        genderDropdown.classList.toggle('show');
    });

    genderOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectGender(option.dataset.value, option.textContent);
        });
    });

    ratingOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectRating(option.dataset.category, parseInt(option.dataset.rating), option);
        });
    });

    improvementTextarea.addEventListener('input', e => {
        AppState.improvementSuggestions = e.target.value;
    });

    submitFeedbackBtn.addEventListener('click', submitFeedback);
    exportBtn.addEventListener('click', exportFeedback);
    aiAnalysisBtn.addEventListener('click', showAIAnalysis);

    document.addEventListener('click', e => {
        if (!genderToggle.contains(e.target) && !genderDropdown.contains(e.target)) {
            genderDropdown.classList.remove('show');
        }
    });
}

// ============================================
// Gender
// ============================================
function selectGender(value, text) {
    AppState.gender = value;
    genderToggle.querySelector('span').textContent = text;
    genderDropdown.classList.remove('show');
    validateForm();
}

// ============================================
// Ratings
// ============================================
function selectRating(category, rating, element) {
    AppState.ratings[category] = rating;

    document
        .querySelectorAll(`.rating-option[data-category="${category}"] .rating-circle`)
        .forEach(c => c.classList.remove('selected'));

    element.querySelector('.rating-circle').classList.add('selected');
    validateForm();
}

// ============================================
// Validation
// ============================================
function validateForm() {
    let valid = true;

    if (!AppState.patientName || AppState.patientName.length < 2) valid = false;
    if (!AppState.gender) valid = false;

    if (!Object.values(AppState.ratings).every(r => r !== null)) valid = false;

    submitFeedbackBtn.disabled = !valid;
    submitFeedbackBtn.style.opacity = valid ? '1' : '0.6';
    return valid;
}

// ============================================
// SUBMIT (🔥 التعديل الحقيقي هنا 🔥)
// ============================================
async function submitFeedback() {
    if (!validateForm()) {
        showToast('Please complete all required fields', 'warning');
        return;
    }

    const ratings = Object.values(AppState.ratings);
    const overallRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);

    const feedbackData = {
        patient_name: AppState.patientName,
        gender: AppState.gender,
        doctor_knowledge: AppState.ratings.doctor_knowledge,
        doctor_kindness: AppState.ratings.doctor_kindness,
        nurse_patience: AppState.ratings.nurse_patience,
        nurse_knowledge: AppState.ratings.nurse_knowledge,
        waiting_time: AppState.ratings.waiting_time,
        hygiene: AppState.ratings.hygiene,
        improvement_suggestions: AppState.improvementSuggestions,
        overall_rating: parseFloat(overallRating),
        submission_date: new Date().toISOString().split('T')[0],
        status: 'pending'
    };

    submitFeedbackBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitFeedbackBtn.disabled = true;

    try {
        const response = await fetch('/api/feedback/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackData)
        });

        const result = await response.json();

        if (!result.success) throw new Error(result.message);

        showToast('Feedback submitted successfully', 'success');
        setTimeout(resetForm, 1500);

    } catch (err) {
        showToast(err.message || 'Submit failed', 'error');
    } finally {
        submitFeedbackBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
        submitFeedbackBtn.disabled = false;
    }
}

// ============================================
// Reset
// ============================================
function resetForm() {
    patientNameInput.value = '';
    AppState.patientName = '';
    AppState.gender = null;
    AppState.improvementSuggestions = '';

    genderToggle.querySelector('span').textContent = 'Please Select';

    AppState.ratings = {
        doctor_knowledge: null,
        doctor_kindness: null,
        nurse_patience: null,
        nurse_knowledge: null,
        waiting_time: null,
        hygiene: null
    };

    document.querySelectorAll('.rating-circle').forEach(c => c.classList.remove('selected'));
    improvementTextarea.value = '';
    validateForm();
}

// ============================================
// Export
// ============================================
function exportFeedback() {
    window.location.href = '/api/feedback/export';
}

// ============================================
// AI
// ============================================
function showAIAnalysis() {
    alert('🤖 AI Analysis (Demo)');
}

// ============================================
// Toast
// ============================================
function showToast(msg, type = 'info') {
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}
