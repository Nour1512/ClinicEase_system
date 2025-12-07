// Notification Model
class NotificationModel {
    constructor() {
        this.notifications = [
            {
                id: 1,
                title: "New Customer Registration",
                message: "We're pleased to inform you that a new customer has registered. Please follow up promptly by contacting them for onboarding.",
                time: "Just Now",
                type: "Registration",
                priority: "high",
                unread: true,
                source: "System"
            },
            {
                id: 2,
                title: "System Maintenance Alert",
                message: "Scheduled maintenance will occur on December 10, 2024, from 2:00 AM to 4:00 AM. System may be unavailable during this time.",
                time: "2 hours ago",
                type: "System Alert",
                priority: "medium",
                unread: true,
                source: "System Admin"
            },
            {
                id: 3,
                title: "Monthly Sales Target Update",
                message: "Hello Sales Marketing Team, This is a reminder to achieve this month's sales target. Currently, we've reached 65% of our goal.",
                time: "1 day ago",
                type: "Reminder",
                priority: "medium",
                unread: true,
                source: "Sales Manager"
            },
            {
                id: 4,
                title: "Product Information Request",
                message: "We've received a product information request from a potential customer. Please respond within 24 hours.",
                time: "2 days ago",
                type: "Customer Request",
                priority: "high",
                unread: false,
                source: "Customer Portal"
            },
            {
                id: 5,
                title: "Meeting Scheduled",
                message: "A meeting has been scheduled with MedTech Inc. for next Tuesday at 2 PM. Please prepare the presentation materials.",
                time: "3 days ago",
                type: "Appointment",
                priority: "medium",
                unread: false,
                source: "Calendar System"
            },
            {
                id: 6,
                title: "Contract Review Required",
                message: "Contract or proposal currently under negotiation with HealthCorp requires your review and approval.",
                time: "5 days ago",
                type: "Reminder",
                priority: "low",
                unread: false,
                source: "Legal Department"
            },
            {
                id: 7,
                title: "Customer Follow-up Required",
                message: "Follow-up required with customer after their recent purchase. Please schedule a call within 48 hours.",
                time: "1 week ago",
                type: "Follow-up",
                priority: "medium",
                unread: false,
                source: "CRM System"
            },
            {
                id: 8,
                title: "Positive Customer Feedback",
                message: "Received positive feedback from a satisfied customer regarding our services. Great work team!",
                time: "1 week ago",
                type: "Feedback",
                priority: "low",
                unread: false,
                source: "Customer Portal"
            },
            {
                id: 9,
                title: "Inventory Alert: Low Stock",
                message: "Inventory levels for 'Aspirin Ring' are below minimum threshold. Please reorder immediately.",
                time: "1 week ago",
                type: "Inventory Alert",
                priority: "high",
                unread: true,
                source: "Inventory System"
            },
            {
                id: 10,
                title: "System Update Available",
                message: "New system update version 2.5.2 is available for installation. Update includes security patches and performance improvements.",
                time: "2 weeks ago",
                type: "Update",
                priority: "medium",
                unread: false,
                source: "System Admin"
            },
            {
                id: 11,
                title: "New Supplier Registered",
                message: "New supplier 'Biobact International' has been registered in the system. Please review their documentation.",
                time: "2 weeks ago",
                type: "Supplier Update",
                priority: "low",
                unread: false,
                source: "Supplier Portal"
            },
            {
                id: 12,
                title: "Payment Received",
                message: "Payment of $12,500 has been received from MedTech Inc. for invoice #INV-2023-0456.",
                time: "3 weeks ago",
                type: "Payment",
                priority: "low",
                unread: false,
                source: "Accounting System"
            }
        ];
        
        this.filteredNotifications = [...this.notifications];
    }
    
    getAllNotifications() {
        return this.filteredNotifications;
    }
    
    getNotificationById(id) {
        return this.notifications.find(notification => notification.id === id);
    }
    
    getUnreadCount() {
        return this.notifications.filter(notification => notification.unread).length;
    }
    
    getTotalCount() {
        return this.notifications.length;
    }
    
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.unread = false;
            return true;
        }
        return false;
    }
    
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.unread = false;
        });
    }
    
    deleteNotification(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            this.notifications.splice(index, 1);
            return true;
        }
        return false;
    }
    
    clearAll() {
        this.notifications = [];
    }
    
    filterByType(type) {
        if (type === "All Notifications") {
            this.filteredNotifications = [...this.notifications];
        } else if (type === "System Alerts") {
            this.filteredNotifications = this.notifications.filter(
                notification => notification.type.includes("Alert") || notification.source === "System"
            );
        } else if (type === "User Messages") {
            this.filteredNotifications = this.notifications.filter(
                notification => !notification.type.includes("System") && !notification.source.includes("System")
            );
        } else if (type === "Updates") {
            this.filteredNotifications = this.notifications.filter(
                notification => notification.type === "Update"
            );
        } else {
            this.filteredNotifications = this.notifications.filter(
                notification => notification.type === type
            );
        }
    }
    
    searchNotifications(query) {
        if (!query.trim()) {
            this.filteredNotifications = [...this.notifications];
            return;
        }
        
        const searchTerm = query.toLowerCase();
        this.filteredNotifications = this.notifications.filter(
            notification => 
                notification.title.toLowerCase().includes(searchTerm) ||
                notification.message.toLowerCase().includes(searchTerm) ||
                notification.type.toLowerCase().includes(searchTerm) ||
                notification.source.toLowerCase().includes(searchTerm)
        );
    }
    
    sortNotifications(order = "newest") {
        if (order === "newest") {
            // Sort by ID (simulating date sorting)
            this.filteredNotifications.sort((a, b) => b.id - a.id);
        } else {
            this.filteredNotifications.sort((a, b) => a.id - b.id);
        }
    }
}

// Notification View
class NotificationView {
    constructor() {
        this.notificationGrid = document.getElementById('notificationGrid');
        this.totalNotificationsEl = document.getElementById('totalNotifications');
        this.headerUnreadEl = document.getElementById('headerUnread');
        this.unreadCountEl = document.getElementById('unreadCount');
        this.searchInput = document.getElementById('searchInput');
        this.markAllReadBtn = document.getElementById('markAllReadBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.modal = document.getElementById('notificationModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalBody = document.getElementById('modalBody');
        this.closeModal = document.getElementById('closeModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.markAsReadBtn = document.getElementById('markAsReadBtn');
        
        // Filter checkboxes
        this.filterCheckboxes = document.querySelectorAll('.filter-links input[type="checkbox"]');
        
        this.currentNotificationId = null;
    }
    
    renderNotifications(notifications) {
        this.notificationGrid.innerHTML = '';
        
        if (notifications.length === 0) {
            this.notificationGrid.innerHTML = `
                <div class="no-notifications" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #bdc3c7; margin-bottom: 20px;">
                        <i class="fas fa-bell-slash"></i>
                    </div>
                    <h3 style="color: #7f8c8d; margin-bottom: 10px; font-size: 20px;">No Notifications Found</h3>
                    <p style="color: #95a5a6; max-width: 400px; margin: 0 auto;">You're all caught up or your search didn't match any notifications.</p>
                </div>
            `;
            return;
        }
        
        // notifications.forEach(notification => {
        //     const priorityClass = priority-${notification.priority};
        //     const notificationCard = document.createElement('div');
        //     notificationCard.className = notification-card ${notification.unread ? 'unread' : ''} ${notification.priority}-priority;
        //     notificationCard.dataset.id = notification.id;
        //     notificationCard.innerHTML = `
        //         ${notification.unread ? '<div class="unread-badge">!</div>' : ''}
        //         <div class="notification-header">
        //             <h3 class="notification-title">${notification.title}</h3>
        //             <span class="notification-time">${notification.time}</span>
        //         </div>
        //         <div class="notification-body">
        //             ${notification.message.substring(0, 120)}${notification.message.length > 120 ? '...' : ''}
        //         </div>
        //         <div class="notification-footer">
        //             <span class="notification-type">${notification.type}</span>
        //             <span class="notification-priority ${priorityClass}">${notification.priority}</span>
        //         </div>
        //     `;
            
        //     this.notificationGrid.appendChild(notificationCard);
        // });
    }
    
    updateCounts(total, unread) {
        this.totalNotificationsEl.textContent = total;
        this.headerUnreadEl.textContent = unread;
        this.unreadCountEl.textContent = unread;
    }
    
    showNotificationDetails(notification) {
        this.modalTitle.textContent = notification.title;
        
        let priorityColor;
        switch(notification.priority) {
            case 'high': priorityColor = '#e74c3c'; break;
            case 'medium': priorityColor = '#f39c12'; break;
            case 'low': priorityColor = '#2ecc71'; break;
            default: priorityColor = '#3498db';
        }
        
        this.modalBody.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <div>
                        <p><strong>Time:</strong> ${notification.time}</p>
                        <p><strong>Type:</strong> ${notification.type}</p>
                        <p><strong>Source:</strong> ${notification.source}</p>
                    </div>
                    <div>
                        <p><strong>Priority:</strong> 
                            <span style="color: ${priorityColor}; font-weight: bold;">${notification.priority.toUpperCase()}</span>
                        </p>
                        <p><strong>Status:</strong> 
                            <span style="color: ${notification.unread ? '#e74c3c' : '#2ecc71'}; font-weight: bold;">
                                ${notification.unread ? 'UNREAD' : 'READ'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <p><strong>Message:</strong></p>
                <p style="line-height: 1.6;">${notification.message}</p>
            </div>
            <div style="font-size: 12px; color: #95a5a6; text-align: center;">
                Notification ID: ${notification.id}
            </div>
        `;
        
        this.currentNotificationId = notification.id;
        this.modal.classList.add('active');
    }
    
    closeNotificationModal() {
        this.modal.classList.remove('active');
        this.currentNotificationId = null;
    }
    
    bindSearch(handler) {
        this.searchInput.addEventListener('input', (e) => {
            handler(e.target.value);
        });
    }
    
    bindFilter(handler) {
        this.filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                // Uncheck other filter checkboxes when one is checked
                if (e.target.checked && e.target.parentElement.querySelector('.nav-text').textContent !== "All Notifications") {
                    this.filterCheckboxes.forEach(cb => {
                        if (cb !== e.target && cb.parentElement.querySelector('.nav-text').textContent !== "All Notifications") {
                            cb.checked = false;
                        }
                    });
                }
                
                const filterText = e.target.parentElement.querySelector('.nav-text').textContent;
                handler(filterText);
            });
        });
    }
    
    bindMarkAllRead(handler) {
        this.markAllReadBtn.addEventListener('click', handler);
    }
    
    bindClearAll(handler) {
        this.clearAllBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear all notifications? This action cannot be undone.")) {
                handler();
            }
        });
    }
    
    bindExport(handler) {
        this.exportBtn.addEventListener('click', handler);
    }
    
    bindViewNotification(handler) {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-card')) {
                const card = e.target.closest('.notification-card');
                const id = parseInt(card.dataset.id);
                handler(id);
            }
        });
    }
    
    bindMarkAsRead(handler) {
        this.markAsReadBtn.addEventListener('click', () => {
            if (this.currentNotificationId) {
                handler(this.currentNotificationId);
                this.closeNotificationModal();
            }
        });
    }
    
    bindCloseModal(handler) {
        this.closeModal.addEventListener('click', handler);
        this.closeModalBtn.addEventListener('click', handler);
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                handler();
            }
        });
    }
}

// Notification Controller
class NotificationController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        // Initialize
        this.onListChanged();
        
        // Bind view events
        this.view.bindSearch(this.handleSearch.bind(this));
        this.view.bindFilter(this.handleFilter.bind(this));
        this.view.bindMarkAllRead(this.handleMarkAllRead.bind(this));
        this.view.bindClearAll(this.handleClearAll.bind(this));
        this.view.bindExport(this.handleExport.bind(this));
        this.view.bindViewNotification(this.handleViewNotification.bind(this));
        this.view.bindMarkAsRead(this.handleMarkAsRead.bind(this));
        this.view.bindCloseModal(this.handleCloseModal.bind(this));
    }
    
    onListChanged() {
        const notifications = this.model.getAllNotifications();
        const total = this.model.getTotalCount();
        const unread = this.model.getUnreadCount();
        
        this.view.renderNotifications(notifications);
        this.view.updateCounts(total, unread);
    }
    
    handleSearch(query) {
        this.model.searchNotifications(query);
        this.onListChanged();
    }
    
    handleFilter(type) {
        this.model.filterByType(type);
        this.onListChanged();
    }
    
    handleMarkAllRead() {
        this.model.markAllAsRead();
        this.onListChanged();
    }
    
    handleClearAll() {
        this.model.clearAll();
        this.onListChanged();
    }
    
    handleExport() {
        const dataStr = JSON.stringify(this.model.notifications, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'notifications_export.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert('Notification data exported successfully!');
    }
    
    handleViewNotification(id) {
        const notification = this.model.getNotificationById(id);
        if (notification) {
            this.view.showNotificationDetails(notification);
        }
    }
    
    handleMarkAsRead(id) {
        this.model.markAsRead(id);
        this.onListChanged();
    }
    
    handleCloseModal() {
        this.view.closeNotificationModal();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const model = new NotificationModel();
    const view = new NotificationView();
    const controller = new NotificationController(model, view);
    
    // Add click effect to notification cards
    document.addEventListener('click', (e) => {
        if (e.target.closest('.notification-card')) {
            const card = e.target.closest('.notification-card');
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        }
    });
});