// Doctors Page - Simple Implementation
console.log('Doctors page script loaded');

// Wait for page to load
window.onload = function() {
    console.log('Page loaded, initializing...');
    initializePage();
};

// Main initialization function
function initializePage() {
    try {
        // Setup all event listeners
        setupEventListeners();
        
        // Update counters
        updateDoctorCount();
        
        console.log('Page initialized successfully');
    } catch (error) {
        console.error('Error during initialization:', error);
        showError('Failed to initialize page');
    }
}

// Setup all event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Book appointment buttons (event delegation)
    document.addEventListener('click', function(event) {
        const bookButton = event.target.closest('.book-btn');
        if (bookButton) {
            event.preventDefault();
            handleBookAppointment(bookButton);
        }
        
        // Navigation links
        const navLink = event.target.closest('.nav-link');
        if (navLink) {
            event.preventDefault();
            handleNavigation(navLink);
        }
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Filter functionality
    const specialtyFilter = document.getElementById('specialtyFilter');
    if (specialtyFilter) {
        specialtyFilter.addEventListener('change', handleFilter);
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
    
    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    console.log('Event listeners setup complete');
}

// Handle book appointment
function handleBookAppointment(button) {
    const doctorId = button.getAttribute('data-id');
    const doctorCard = button.closest('.doctor-card');
    const doctorName = doctorCard.querySelector('.doctor-name').textContent;
    
    console.log('Booking appointment with doctor ID:', doctorId);
    
    // Disable button during booking
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Booking...';
    
    // Add spinner styles if not exists
    if (!document.querySelector('#spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = `
            .spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid #ffffff;
                border-radius: 50%;
                border-top-color: transparent;
                animation: spin 0.8s linear infinite;
                margin-right: 8px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Simulate API call
    setTimeout(function() {
        // Re-enable button
        button.disabled = false;
        button.innerHTML = originalText;
        
        // Show success message
        showSuccess('Appointment request sent to ' + doctorName + '! You will be contacted soon.');
        
        console.log('Appointment booked successfully for doctor ID:', doctorId);
    }, 2000);
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    console.log('Searching for:', searchTerm);
    
    const doctorCards = document.querySelectorAll('.doctor-card');
    let visibleCount = 0;
    
    doctorCards.forEach(function(card) {
        const doctorName = card.querySelector('.doctor-name').textContent.toLowerCase();
        const specialty = card.querySelector('.doctor-specialty').textContent.toLowerCase();
        
        if (doctorName.includes(searchTerm) || specialty.includes(searchTerm)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    updateDoctorCount(visibleCount);
}

// Handle filter
function handleFilter(event) {
    const filterValue = event.target.value.toLowerCase();
    console.log('Filtering by:', filterValue);
    
    const doctorCards = document.querySelectorAll('.doctor-card');
    let visibleCount = 0;
    
    doctorCards.forEach(function(card) {
        const specialty = card.querySelector('.doctor-specialty').textContent.toLowerCase();
        
        if (filterValue === 'all' || filterValue === '' || specialty.includes(filterValue)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    updateDoctorCount(visibleCount);
}

// Handle sort
function handleSort(event) {
    const sortValue = event.target.value;
    console.log('Sorting by:', sortValue);
    
    const gridContainer = document.getElementById('doctorsGrid');
    if (!gridContainer) return;
    
    const doctorCards = Array.from(gridContainer.querySelectorAll('.doctor-card'));
    
    doctorCards.sort(function(a, b) {
        const priceA = parseInt(a.querySelector('.price').textContent.replace('$', '') || 0);
        const priceB = parseInt(b.querySelector('.price').textContent.replace('$', '') || 0);
        const nameA = a.querySelector('.doctor-name').textContent;
        const nameB = b.querySelector('.doctor-name').textContent;
        
        switch(sortValue) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'name':
                return nameA.localeCompare(nameB);
            case 'rating':
                // For rating, you would need to extract it from the card
                return 0;
            default:
                return 0;
        }
    });
    
    // Reorder cards in the grid
    doctorCards.forEach(function(card) {
        gridContainer.appendChild(card);
    });
}

// Handle navigation
function handleNavigation(link) {
    const page = link.getAttribute('href');
    const pageName = link.textContent.trim();
    
    console.log('Navigating to:', pageName);
    
    // Remove active class from all links
    document.querySelectorAll('.nav-link').forEach(function(navLink) {
        navLink.classList.remove('active');
    });
    
    // Add active class to clicked link
    link.classList.add('active');
    
    // Show loading message for non-current pages
    if (page && page !== window.location.pathname && page !== '#') {
        showInfo('Loading ' + pageName + '...');
    }
}

// Handle logout
function handleLogout() {
    console.log('Logging out...');
    showInfo('Logging out... Please wait.');
    
    setTimeout(function() {
        window.location.href = '/logout';
    }, 1500);
}

// Update doctor count
function updateDoctorCount(count) {
    const totalElement = document.getElementById('totalDoctors');
    const countElement = document.getElementById('totalDoctorsCount');
    
    if (!totalElement || !countElement) return;
    
    if (count !== undefined) {
        totalElement.textContent = count;
        countElement.textContent = count;
    } else {
        const doctorCards = document.querySelectorAll('.doctor-card');
        const visibleCards = Array.from(doctorCards).filter(card => 
            card.style.display !== 'none'
        );
        const finalCount = visibleCards.length || doctorCards.length;
        totalElement.textContent = finalCount;
        countElement.textContent = finalCount;
    }
}

// Notification functions
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showInfo(message) {
    showNotification(message, 'info');
}

function showMessage(message) {
    showNotification(message, 'message');
}

// Show notification
function showNotification(message, type) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-text">${message}</span>
        </div>
        <button class="notification-close">×</button>
    `;
    
    // Add close event listener
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.remove();
    });
    
    // Add styles if not exists
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                padding: 15px 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                animation: slideIn 0.3s ease-out;
                border-left: 4px solid #3594A9;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .notification-success {
                border-left-color: #10b981;
            }
            
            .notification-error {
                border-left-color: #dc2626;
            }
            
            .notification-info {
                border-left-color: #3594A9;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            
            .notification-icon {
                font-size: 20px;
            }
            
            .notification-text {
                font-size: 14px;
                color: #374151;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                margin-left: 15px;
                line-height: 1;
            }
            
            .notification-close:hover {
                color: #374151;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(function() {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Get notification icon
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'info': return 'ℹ';
        default: return '📢';
    }
}

// Initialize the page when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializePage();
    });
} else {
    // DOM is already ready
    initializePage();
}