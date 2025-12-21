// Main Application State
const AppState = {
    selectedGender: null,
    selectedBirthDate: {
        month: null,
        day: null,
        year: null
    },
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
const genderToggle = document.getElementById('genderToggle');
const genderDropdown = document.getElementById('genderDropdown');
const genderOptions = document.querySelectorAll('.gender-option');
const monthSelect = document.getElementById('monthSelect');
const daySelect = document.getElementById('daySelect');
const yearSelect = document.getElementById('yearSelect');
const ratingOptions = document.querySelectorAll('.rating-option');
const improvementTextarea = document.getElementById('improvementTextarea');
const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
const analyticsBtn = document.getElementById('analyticsBtn');
const exportBtn = document.getElementById('exportBtn');
const aiAnalysisBtn = document.getElementById('aiAnalysisBtn');
const toast = document.getElementById('toast');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initDateSelectors();
    initEventListeners();
    loadStats();
});

// Initialize Date Selectors
function initDateSelectors() {
    // Populate days (1-31)
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
    
    // Populate years (1900-current year)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1900; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
    
    // Set default to 18 years ago
    const defaultYear = currentYear - 18;
    yearSelect.value = defaultYear;
    AppState.selectedBirthDate.year = defaultYear;
}

// Initialize Event Listeners
function initEventListeners() {
    // Gender selection
    genderToggle.addEventListener('click', toggleGenderDropdown);
    
    genderOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectGender(this.dataset.value, this.textContent);
        });
    });
    
    // Close gender dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!genderToggle.contains(event.target) && !genderDropdown.contains(event.target)) {
            genderDropdown.classList.remove('show');
        }
    });
    
    // Date selection
    monthSelect.addEventListener('change', function() {
        AppState.selectedBirthDate.month = parseInt(this.value);
        updateDateValidation();
    });
    
    daySelect.addEventListener('change', function() {
        AppState.selectedBirthDate.day = parseInt(this.value);
    });
    
    yearSelect.addEventListener('change', function() {
        AppState.selectedBirthDate.year = parseInt(this.value);
        updateDateValidation();
    });
    
    // Rating selection
    ratingOptions.forEach(option => {
        option.addEventListener('click', function() {
            const category = this.dataset.category;
            const rating = parseInt(this.dataset.rating);
            selectRating(category, rating, this);
        });
    });
    
    // Improvement suggestions
    improvementTextarea.addEventListener('input', function() {
        AppState.improvementSuggestions = this.value;
    });
    
    // Submit button
    submitFeedbackBtn.addEventListener('click', submitFeedback);
    
    // Analytics button
    analyticsBtn.addEventListener('click', showAnalytics);
    
    // Export button
    exportBtn.addEventListener('click', exportFeedback);
    
    // AI Analysis button
    aiAnalysisBtn.addEventListener('click', showAIAnalysis);
}

// Toggle Gender Dropdown
function toggleGenderDropdown() {
    genderDropdown.classList.toggle('show');
}

// Select Gender
function selectGender(value, displayText) {
    AppState.selectedGender = value;
    
    // Update UI
    genderToggle.querySelector('span').textContent = displayText;
    genderDropdown.classList.remove('show');
    
    // Update selected state
    genderOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.value === value) {
            option.classList.add('selected');
        }
    });
    
    showToast('Gender selected: ' + displayText, 'success');
}

// Update Date Validation
function updateDateValidation() {
    const { month, year } = AppState.selectedBirthDate;
    
    if (month && year) {
        // Get days in month
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // Update day options
        const currentDay = parseInt(daySelect.value);
        daySelect.innerHTML = '<option value="" selected disabled>Please select a day</option>';
        
        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (currentDay === i) {
                option.selected = true;
            }
            daySelect.appendChild(option);
        }
        
        // If current day is valid, keep it selected
        if (currentDay && currentDay <= daysInMonth) {
            daySelect.value = currentDay;
            AppState.selectedBirthDate.day = currentDay;
        }
    }
}

// Select Rating
function selectRating(category, rating, element) {
    // Update state
    AppState.ratings[category] = rating;
    
    // Update UI for all options in this category
    const allOptionsInCategory = document.querySelectorAll(`.rating-option[data-category="${category}"]`);
    
    allOptionsInCategory.forEach(option => {
        const circle = option.querySelector('.rating-circle');
        circle.classList.remove('selected');
        
        if (parseInt(option.dataset.rating) === rating) {
            circle.classList.add('selected');
        }
    });
    
    // Show feedback
    const ratingLabels = {
        1: 'Very unsatisfied',
        2: 'Unsatisfied',
        3: 'Neutral',
        4: 'Satisfied',
        5: 'Very satisfied'
    };
    
    const categoryLabels = {
        'doctor_knowledge': 'Doctor Knowledge',
        'doctor_kindness': 'Doctor Kindness',
        'nurse_patience': 'Nurse Patience',
        'nurse_knowledge': 'Nurse Knowledge',
        'waiting_time': 'Waiting Time',
        'hygiene': 'Hygiene'
    };
    
    showToast(`${categoryLabels[category]}: ${ratingLabels[rating]}`, 'success');
}

// Validate Form
function validateForm() {
    const errors = [];
    
    // Validate gender
    if (!AppState.selectedGender) {
        errors.push('Please select your gender');
    }
    
    // Validate birth date
    if (!AppState.selectedBirthDate.month) {
        errors.push('Please select birth month');
    }
    
    if (!AppState.selectedBirthDate.day) {
        errors.push('Please select birth day');
    }
    
    if (!AppState.selectedBirthDate.year) {
        errors.push('Please select birth year');
    }
    
    // Validate ratings
    const categories = Object.keys(AppState.ratings);
    for (const category of categories) {
        if (AppState.ratings[category] === null) {
            errors.push(`Please rate "${category.replace('_', ' ')}"`);
        }
    }
    
    // Validate improvement suggestions (optional)
    if (AppState.improvementSuggestions.trim().length > 500) {
        errors.push('Improvement suggestions should not exceed 500 characters');
    }
    
    return errors;
}

// Submit Feedback
async function submitFeedback() {
    // Validate form
    const errors = validateForm();
    
    if (errors.length > 0) {
        showToast(errors[0], 'error');
        return;
    }
    
    // Show loading state
    const originalText = submitFeedbackBtn.innerHTML;
    submitFeedbackBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitFeedbackBtn.disabled = true;
    
    try {
        // Prepare data
        const feedbackData = {
            gender: AppState.selectedGender,
            birth_month: AppState.selectedBirthDate.month,
            birth_day: AppState.selectedBirthDate.day,
            birth_year: AppState.selectedBirthDate.year,
            doctor_knowledge: AppState.ratings.doctor_knowledge,
            doctor_kindness: AppState.ratings.doctor_kindness,
            nurse_patience: AppState.ratings.nurse_patience,
            nurse_knowledge: AppState.ratings.nurse_knowledge,
            waiting_time: AppState.ratings.waiting_time,
            hygiene: AppState.ratings.hygiene,
            improvement_suggestions: AppState.improvementSuggestions
        };
        
        // Send to server
        const response = await fetch('/api/feedback/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedbackData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(result.message, 'success');
            resetForm();
        } else {
            showToast(result.message, 'error');
        }
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showToast('Error submitting feedback. Please try again.', 'error');
    } finally {
        // Restore button state
        submitFeedbackBtn.innerHTML = originalText;
        submitFeedbackBtn.disabled = false;
    }
}

// Reset Form
function resetForm() {
    // Reset gender
    AppState.selectedGender = null;
    genderToggle.querySelector('span').textContent = 'Please Select';
    genderOptions.forEach(option => option.classList.remove('selected'));
    
    // Reset birth date
    AppState.selectedBirthDate = { month: null, day: null, year: null };
    monthSelect.value = '';
    daySelect.value = '';
    yearSelect.value = new Date().getFullYear() - 18;
    
    // Reset ratings
    AppState.ratings = {
        doctor_knowledge: null,
        doctor_kindness: null,
        nurse_patience: null,
        nurse_knowledge: null,
        waiting_time: null,
        hygiene: null
    };
    
    ratingOptions.forEach(option => {
        option.querySelector('.rating-circle').classList.remove('selected');
    });
    
    // Reset improvement suggestions
    AppState.improvementSuggestions = '';
    improvementTextarea.value = '';
    
    // Reinitialize date selectors
    initDateSelectors();
}

// Show Toast Notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = 'toast';
    
    // Add type class
    toast.classList.add(type);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('visible');
    }, 10);
    
    // Hide toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 4000);
}

// Load Statistics
async function loadStats() {
    try {
        const response = await fetch('/api/feedback/stats');
        const result = await response.json();
        
        if (result.success) {
            console.log('Feedback statistics:', result.stats);
            // You can update the UI with stats here
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Show Analytics
function showAnalytics() {
    showToast('Opening analytics dashboard...', 'info');
    
    // In a real application, this would redirect to an analytics page
    setTimeout(() => {
        // Simulate analytics dashboard
        const analyticsWindow = window.open('', '_blank');
        analyticsWindow.document.write(`
            <html>
                <head>
                    <title>Feedback Analytics</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #4f46e5; }
                        .stat-card { background: #f5f7fb; padding: 20px; border-radius: 10px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <h1>📊 Feedback Analytics</h1>
                    <div class="stat-card">
                        <h3>Average Rating: 4.2/5</h3>
                        <p>Based on 128 feedback submissions</p>
                    </div>
                    <div class="stat-card">
                        <h3>Most Rated Category: Doctor Kindness</h3>
                        <p>Average: 4.5/5</p>
                    </div>
                    <div class="stat-card">
                        <h3>Improvement Areas</h3>
                        <p>1. Waiting Time (3.8/5)</p>
                        <p>2. Facility Hygiene (4.1/5)</p>
                    </div>
                    <button onclick="window.close()">Close</button>
                </body>
            </html>
        `);
    }, 1000);
}

// Export Feedback
async function exportFeedback() {
    showToast('Exporting feedback data...', 'info');
    
    try {
        const response = await fetch('/api/feedback/all');
        const result = await response.json();
        
        if (result.success && result.feedback.length > 0) {
            // Convert to CSV
            const csv = convertToCSV(result.feedback);
            
            // Download CSV
            downloadCSV(csv, 'patient_feedback.csv');
            
            showToast('Feedback exported successfully!', 'success');
        } else {
            showToast('No feedback data to export', 'warning');
        }
    } catch (error) {
        console.error('Error exporting feedback:', error);
        showToast('Error exporting feedback', 'error');
    }
}

// Convert to CSV
function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            // Handle quotes and commas in values
            const escaped = ('' + value).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

// Download CSV
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    a.click();
    
    window.URL.revokeObjectURL(url);
}

// Show AI Analysis
function showAIAnalysis() {
    showToast('Generating AI analysis of feedback...', 'info');
    
    // In a real application, this would call an AI service
    setTimeout(() => {
        const analysis = `
            🤖 AI Analysis Results:
            
            1. Sentiment Analysis: 85% Positive
            2. Key Strengths: Doctor professionalism, Nurse knowledge
            3. Areas for Improvement: Waiting time management
            4. Common Suggestions: 
               - Reduce appointment wait times
               - Improve facility cleanliness
               - More comfortable waiting areas
            
            Recommendation: Focus on optimizing appointment scheduling and enhancing waiting area comfort.
        `;
        
        alert(analysis);
    }, 1500);
}

// Add CSS for toast types
const style = document.createElement('style');
style.textContent = `
    .toast.success {
        background: #16a34a;
    }
    
    .toast.error {
        background: #dc2626;
    }
    
    .toast.warning {
        background: #f97316;
    }
    
    .toast.info {
        background: #0b1437;
    }
`;
document.head.appendChild(style);