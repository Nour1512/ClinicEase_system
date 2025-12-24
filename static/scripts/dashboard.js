// static/scripts/dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date display
    updateCurrentDate();
    
    // Initialize charts
    initializeCharts();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load real-time data
    loadDashboardData();
    
    // Auto-refresh data every 30 seconds
    setInterval(loadDashboardData, 30000);
});

function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('en-US', options);
    document.getElementById('current-date').textContent = dateString;
}

function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.classList.add('loading');
            loadDashboardData();
            setTimeout(() => {
                this.classList.remove('loading');
            }, 1000);
        });
    }
    
    // Chart filter changes
    const chartFilters = document.querySelectorAll('.chart-filter');
    chartFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            updateChartData(this);
        });
    });
    
    // Table row clicks
    document.querySelectorAll('tbody tr').forEach(row => {
        row.addEventListener('click', function() {
            const appointmentId = this.dataset.id;
            if (appointmentId) {
                viewAppointmentDetails(appointmentId);
            }
        });
    });
    
    // Action buttons
    document.querySelectorAll('.btn-action').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // e.stopPropagation();
            const action = this.classList.contains('view-btn') ? 'view' : 
                          this.classList.contains('edit-btn') ? 'edit' : 'delete';
            handleAction(action, this);
        });
    });
}

function loadDashboardData() {
    // Load stats
    fetch('/api/dashboard/stats')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error loading stats:', data.error);
                return;
            }
            updateStats(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to load dashboard data', 'error');
        });
    
    // Load activities
    fetch('/api/dashboard/activities')
        .then(response => response.json())
        .then(activities => {
            updateActivitiesTable(activities);
        });
    
    // Load appointments
    fetch('/api/dashboard/appointments')
        .then(response => response.json())
        .then(appointments => {
            updateAppointmentsTable(appointments);
        });
}

function updateStats(stats) {
    // Update stat cards
    const statElements = {
        'total-patients': stats.total_patients,
        'total-doctors': stats.total_doctors,
        'today-appointments': stats.today_appointments,
        'total-revenue': `$${stats.total_revenue.toFixed(2)}`
    };
    
    for (const [id, value] of Object.entries(statElements)) {
        const element = document.getElementById(id);
        if (element) {
            // Animate number change
            animateValue(element, parseInt(element.textContent) || 0, value, 1000);
        }
    }
    
    // Update other stats
    updateStatBadges(stats);
}

function animateValue(element, start, end, duration) {
    if (typeof start === 'string') start = parseFloat(start.replace('$', ''));
    if (typeof end === 'string') end = parseFloat(end.replace('$', ''));
    
    const startTime = performance.now();
    const isCurrency = element.textContent.includes('$');
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = start + (end - start) * progress;
        
        if (isCurrency) {
            element.textContent = `$${currentValue.toFixed(2)}`;
        } else {
            element.textContent = Math.round(currentValue);
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

function updateStatBadges(stats) {
    // Update low stock warning
    if (stats.low_stock_medicines > 0) {
        showLowStockWarning(stats.low_stock_medicines);
    }
    
    // Update pending appointments badge
    const badge = document.querySelector('.notification-badge');
    if (badge && stats.pending_appointments > 0) {
        badge.textContent = stats.pending_appointments;
        badge.style.display = 'flex';
    }
}

function showLowStockWarning(count) {
    // Check if warning already exists
    if (document.querySelector('.low-stock-warning')) return;
    
    const warning = document.createElement('div');
    warning.className = 'low-stock-warning';
    warning.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${count} medicine(s) are running low on stock</span>
        <a href="/pharmacy">View Inventory</a>
    `;
    
    warning.style.cssText = `
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        border: 1px solid #f59e0b;
        color: #92400e;
        padding: 12px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
    `;
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(warning, mainContent.firstChild);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            warning.remove();
        }, 10000);
    }
}

function updateActivitiesTable(activities) {
    const tbody = document.getElementById('activities-table');
    if (!tbody || !activities.length) return;
    
    tbody.innerHTML = activities.map(activity => `
        <tr>
            <td>
                <div class="user-cell">
                    <div class="user-avatar ${activity.user_type.toLowerCase()}">
                        <i class="fas fa-${activity.icon || 'user'}"></i>
                    </div>
                    <div>
                        <strong>${activity.user_name}</strong>
                        <small>${activity.user_type}</small>
                    </div>
                </div>
            </td>
            <td>${activity.action}</td>
            <td>${activity.time}</td>
            <td>${activity.date}</td>
        </tr>
    `).join('');
}

function updateAppointmentsTable(appointments) {
    const tbody = document.getElementById('appointments-table');
    if (!tbody || !appointments.length) return;
    
    tbody.innerHTML = appointments.map(appointment => `
        <tr data-id="${appointment.id}">
            <td>
                <div class="patient-cell">
                    <div class="patient-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <span>${appointment.patient_name}</span>
                </div>
            </td>
            <td>Dr. ${appointment.doctor_name}</td>
            <td>
                <div class="time-slot">
                    <i class="far fa-clock"></i>
                    ${appointment.time}
                </div>
            </td>
            <td>
                <span class="status-badge ${appointment.status.toLowerCase()}">
                    ${appointment.status}
                </span>
            </td>
            <td>
                <button class="btn-action view-btn">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Re-attach event listeners
    document.querySelectorAll('#appointments-table tr').forEach(row => {
        row.addEventListener('click', function() {
            viewAppointmentDetails(this.dataset.id);
        });
    });
}

function initializeCharts() {
    // Revenue Chart (Line Chart)
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        const revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: revenueMonths || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: revenueAmounts || [1200, 1900, 3000, 5000, 2000, 3000],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        window.revenueChart = revenueChart;
    }
    
    // Specialty Chart (Doughnut Chart)
    const specialtyCtx = document.getElementById('specialtyChart');
    if (specialtyCtx) {
        const colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#ec4899'
        ];
        
        const specialtyChart = new Chart(specialtyCtx, {
            type: 'doughnut',
            data: {
                labels: specialtyLabels || ['Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology'],
                datasets: [{
                    data: specialtyCounts || [5, 3, 4, 2, 3],
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} doctors (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
        
        window.specialtyChart = specialtyChart;
    }
}

function updateChartData(selectElement) {
    const chartType = selectElement.closest('.chart-container').querySelector('h3').textContent;
    const filterValue = selectElement.value;
    
    // In a real application, you would fetch new data based on the filter
    console.log(`Updating ${chartType} with filter: ${filterValue}`);
    
    // Show loading state
    selectElement.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        selectElement.disabled = false;
        
        // Update charts with new data
        if (chartType.includes('Revenue')) {
            updateRevenueChart(filterValue);
        } else {
            updateSpecialtyChart(filterValue);
        }
    }, 500);
}

function updateRevenueChart(timeRange) {
    // This would fetch new data from the server
    // For now, we'll just update with dummy data
    if (window.revenueChart) {
        const newData = generateRevenueData(timeRange);
        window.revenueChart.data.labels = newData.labels;
        window.revenueChart.data.datasets[0].data = newData.values;
        window.revenueChart.update();
    }
}

function updateSpecialtyChart(department) {
    if (window.specialtyChart) {
        const newData = generateSpecialtyData(department);
        window.specialtyChart.data.labels = newData.labels;
        window.specialtyChart.data.datasets[0].data = newData.values;
        window.specialtyChart.update();
    }
}

function generateRevenueData(timeRange) {
    // Generate dummy data based on time range
    const ranges = {
        'Last 6 Months': { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], values: [1200, 1900, 3000, 5000, 2000, 3000] },
        'Last Year': { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [8000, 12000, 9000, 15000] },
        'Custom Range': { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], values: [1500, 2200, 1800, 2500] }
    };
    
    return ranges[timeRange] || ranges['Last 6 Months'];
}

function generateSpecialtyData(department) {
    const data = {
        'All Departments': {
            labels: ['Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology'],
            values: [5, 3, 4, 2, 3]
        },
        'Surgery': {
            labels: ['General', 'Cardiac', 'Neuro', 'Orthopedic', 'Plastic'],
            values: [3, 2, 1, 2, 1]
        },
        'Cardiology': {
            labels: ['Interventional', 'Non-invasive', 'Pediatric', 'Electrophysiology'],
            values: [2, 3, 1, 2]
        }
    };
    
    return data[department] || data['All Departments'];
}

function viewAppointmentDetails(appointmentId) {
    // In a real application, this would open a modal or navigate to details page
    console.log(`Viewing appointment ${appointmentId}`);
    
    // Show modal or redirect
    // window.location.href = `/appointments/${appointmentId}`;
    
    // For now, show a notification
    showNotification(`Opening appointment #${appointmentId} details...`, 'info');
}

function handleAction(action, button) {
    const row = button.closest('tr');
    const appointmentId = row.dataset.id;
    
    switch(action) {
        case 'view':
            viewAppointmentDetails(appointmentId);
            break;
        case 'edit':
            editAppointment(appointmentId);
            break;
        case 'delete':
            deleteAppointment(appointmentId);
            break;
    }
}

function editAppointment(appointmentId) {
    console.log(`Editing appointment ${appointmentId}`);
    showNotification(`Editing appointment #${appointmentId}...`, 'info');
}

function deleteAppointment(appointmentId) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        console.log(`Deleting appointment ${appointmentId}`);
        showNotification(`Appointment #${appointmentId} deleted`, 'success');
        
        // In a real app, you would make an API call here
        // fetch(`/api/appointments/${appointmentId}`, { method: 'DELETE' })
        //   .then(response => response.json())
        //   .then(data => {
        //       showNotification('Appointment deleted successfully', 'success');
        //       loadDashboardData(); // Refresh data
        //   });
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d1fae5' : type === 'error' ? '#fee2e2' : '#dbeafe'};
        color: ${type === 'success' ? '#065f46' : type === 'error' ? '#991b1b' : '#1e40af'};
        padding: 12px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations for notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: inherit;
        padding: 0;
        margin-left: 10px;
    }
`;
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Refresh with F5
    if (e.key === 'F5') {
        e.preventDefault();
        loadDashboardData();
        showNotification('Dashboard refreshed', 'info');
    }
    
    // Search with Ctrl+F
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.querySelector('input[type="search"]')?.focus();
    }
});

// Export data function
window.exportDashboardData = function() {
    // This would export dashboard data as CSV/PDF
    console.log('Exporting dashboard data...');
    showNotification('Preparing data export...', 'info');
};


