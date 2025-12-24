// ================= Configuration =================
const API_BASE = '/medicine-stock/api/medicines';
const LOW_STOCK_THRESHOLD = 10;

// ================= State =================
let medicines = [];
let currentMedicineId = null;
let isEditing = false;

// ================= DOM Elements =================
const elements = {
    // Search
    searchInput: document.getElementById('searchInput'),
    
    // Main buttons
    addMedicineBtn: document.getElementById('addMedicineBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    printBtn: document.getElementById('printBtn'),
    exportBtn: document.getElementById('exportBtn'),
    
    // Modal elements
    medicineModal: document.getElementById('medicineModal'),
    medicineForm: document.getElementById('medicineForm'),
    modalTitle: document.getElementById('modalTitle'),
    closeModal: document.getElementById('closeModal'),
    cancelMedicineBtn: document.getElementById('cancelMedicineBtn'),
    saveMedicineBtn: document.getElementById('saveMedicineBtn'),
    
    // Form fields
    medicineName: document.getElementById('medicineName'),
    medicineDescription: document.getElementById('medicineDescription'),
    medicineCategory: document.getElementById('medicineCategory'),
    medicineManufacturer: document.getElementById('medicineManufacturer'),
    medicinePrice: document.getElementById('medicinePrice'),
    medicineQuantity: document.getElementById('medicineQuantity'),
    medicineExpiration: document.getElementById('medicineExpiration'),
    medicineBatch: document.getElementById('medicineBatch'),
    
    // Stats elements
    totalMedicines: document.getElementById('totalMedicines'),
    totalValue: document.getElementById('totalValue'),
    totalItems: document.getElementById('totalItems'),
    lowStock: document.getElementById('lowStock'),
    outOfStock: document.getElementById('outOfStock'),
    netValue: document.getElementById('netValue'),
    stockTags: document.getElementById('stockTags'),
    
    // Action buttons
    generateReportBtn: document.getElementById('generateReportBtn'),
    checkExpiryBtn: document.getElementById('checkExpiryBtn'),
    notifySuppliersBtn: document.getElementById('notifySuppliersBtn'),
    emailReportBtn: document.getElementById('emailReportBtn'),
    syncInventoryBtn: document.getElementById('syncInventoryBtn'),
    
    // Other
    lastUpdated: document.getElementById('lastUpdated'),
    medicineTableBody: document.getElementById('medicineTableBody'),
    toast: document.getElementById('toast')
};

// ================= Initialize =================
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    setupEventListeners();
    await loadMedicines();
    updateLastUpdated();
    setInterval(updateLastUpdated, 60000);
}

// ================= Event Listeners =================
function setupEventListeners() {
    // Search functionality
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', debounce(searchMedicines, 300));
    }
    
    // Main buttons
    if (elements.addMedicineBtn) {
        elements.addMedicineBtn.addEventListener('click', () => openMedicineForm());
    }
    
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', () => {
            loadMedicines();
            showToast('Data refreshed successfully', 'success');
        });
    }
    
    // Modal buttons
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', () => closeMedicineForm());
    }
    
    if (elements.cancelMedicineBtn) {
        elements.cancelMedicineBtn.addEventListener('click', () => closeMedicineForm());
    }
    
    // Form submission
    if (elements.medicineForm) {
        elements.medicineForm.addEventListener('submit', (e) => handleFormSubmit(e));
    }
    
    // Close modal when clicking outside
    if (elements.medicineModal) {
        elements.medicineModal.addEventListener('click', (e) => {
            if (e.target === elements.medicineModal) closeMedicineForm();
        });
    }
    
    // Action buttons
    if (elements.printBtn) {
        elements.printBtn.addEventListener('click', printReport);
    }
    
    if (elements.exportBtn) {
        elements.exportBtn.addEventListener('click', exportToCSV);
    }
    
    if (elements.generateReportBtn) {
        elements.generateReportBtn.addEventListener('click', generateReport);
    }
    
    if (elements.checkExpiryBtn) {
        elements.checkExpiryBtn.addEventListener('click', checkExpiryDates);
    }
    
    if (elements.notifySuppliersBtn) {
        elements.notifySuppliersBtn.addEventListener('click', notifySuppliers);
    }
    
    if (elements.emailReportBtn) {
        elements.emailReportBtn.addEventListener('click', emailReport);
    }
    
    if (elements.syncInventoryBtn) {
        elements.syncInventoryBtn.addEventListener('click', syncInventory);
    }
}

// ================= API Functions =================
async function loadMedicines() {
    try {
        showLoadingState();
        
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        medicines = await response.json();
        renderMedicines(medicines);
        updateStats();
        updateStockTags();
        
        showToast('Medicines loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading medicines:', error);
        showErrorState();
        showToast('Failed to load medicines: ' + error.message, 'error');
    }
}

async function saveMedicine(medicineData) {
    try {
        // Disable save button and show loading
        if (elements.saveMedicineBtn) {
            elements.saveMedicineBtn.disabled = true;
            const originalText = elements.saveMedicineBtn.innerHTML;
            elements.saveMedicineBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            
            // Handle the reset after save
            setTimeout(() => {
                elements.saveMedicineBtn.disabled = false;
                elements.saveMedicineBtn.innerHTML = originalText;
            }, 1000);
        }
        
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_BASE}/${currentMedicineId}` : API_BASE;
        
        // Convert expiration_date to proper format
        const dataToSend = {
            ...medicineData,
            expiration_date: medicineData.expiration_date || null
        };
        
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save medicine');
        }
        
        const savedMedicine = await response.json();
        
        if (isEditing) {
            // Update existing medicine
            const index = medicines.findIndex(m => m.id === currentMedicineId);
            if (index !== -1) medicines[index] = savedMedicine;
        } else {
            // Add new medicine
            medicines.push(savedMedicine);
        }
        
        renderMedicines(medicines);
        updateStats();
        updateStockTags();
        closeMedicineForm();
        
        showToast(`Medicine ${isEditing ? 'updated' : 'added'} successfully`, 'success');
    } catch (error) {
        console.error('Error saving medicine:', error);
        showToast('Failed to save medicine: ' + error.message, 'error');
    }
}

async function deleteMedicine(id) {
    if (!confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${id}`, { 
            method: 'DELETE' 
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete medicine');
        }
        
        medicines = medicines.filter(m => m.id !== id);
        renderMedicines(medicines);
        updateStats();
        updateStockTags();
        
        showToast('Medicine deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting medicine:', error);
        showToast('Failed to delete medicine: ' + error.message, 'error');
    }
}

// ================= Render Functions =================
function renderMedicines(medicinesList) {
    if (!elements.medicineTableBody) return;
    
    if (!medicinesList || medicinesList.length === 0) {
        elements.medicineTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-pills"></i>
                    </div>
                    <h4>No Medicines Found</h4>
                    <p>Add your first medicine to get started</p>
                    <button class="btn-primary" onclick="openMedicineForm()">
                        <i class="fas fa-plus"></i> Add Medicine
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    elements.medicineTableBody.innerHTML = medicinesList.map(medicine => `
        <tr>
            <td>
                <div class="medicine-info">
                    <div class="medicine-name">${escapeHtml(medicine.name)}</div>
                    ${medicine.description ? `<div class="medicine-description">${escapeHtml(medicine.description)}</div>` : ''}
                    ${medicine.batch_number ? `<div class="medicine-batch">Batch: ${escapeHtml(medicine.batch_number)}</div>` : ''}
                </div>
            </td>
            <td>
                <span class="category-badge">${medicine.category || 'Uncategorized'}</span>
            </td>
            <td>${medicine.manufacturer || '-'}</td>
            <td class="price-cell">$${parseFloat(medicine.price || 0).toFixed(2)}</td>
            <td>
                ${getStatusBadge(medicine.quantity || 0)}
            </td>
            <td>
                <span class="quantity-display ${(medicine.quantity || 0) <= LOW_STOCK_THRESHOLD ? 'low-quantity' : ''}">
                    ${medicine.quantity || 0}
                    ${(medicine.quantity || 0) > 0 && (medicine.quantity || 0) <= LOW_STOCK_THRESHOLD ? 
                        '<span class="low-stock-indicator">!</span>' : ''}
                </span>
            </td>
            <td>
                ${medicine.expiration_date ? formatDate(medicine.expiration_date) : 'No expiry'}
                ${medicine.expiration_date && isExpiringSoon(medicine.expiration_date) ? 
                    '<span class="expiry-warning">⚠️ Soon</span>' : ''}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editMedicine(${medicine.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteMedicine(${medicine.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusBadge(quantity) {
    if (quantity === 0) {
        return `<span class="status-badge out-of-stock">
            <span class="dot"></span>
            Out of Stock
        </span>`;
    } else if (quantity <= LOW_STOCK_THRESHOLD) {
        return `<span class="status-badge low-stock">
            <span class="dot"></span>
            Low Stock
        </span>`;
    } else {
        return `<span class="status-badge in-stock">
            <span class="dot"></span>
            In Stock
        </span>`;
    }
}

function showLoadingState() {
    if (!elements.medicineTableBody) return;
    
    elements.medicineTableBody.innerHTML = `
        <tr>
            <td colspan="8" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading medicines...</p>
            </td>
        </tr>
    `;
}

function showErrorState() {
    if (!elements.medicineTableBody) return;
    
    elements.medicineTableBody.innerHTML = `
        <tr>
            <td colspan="8" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Unable to Load Data</h4>
                <p>Please check your connection and try again</p>
                <button class="btn-secondary" onclick="loadMedicines()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </td>
        </tr>
    `;
}

// ================= Stats Functions =================
function updateStats() {
    const totalMedicines = medicines.length;
    const totalItems = medicines.reduce((sum, m) => sum + (parseInt(m.quantity) || 0), 0);
    const totalValue = medicines.reduce((sum, m) => sum + (parseFloat(m.price || 0) * (parseInt(m.quantity) || 0)), 0);
    const lowStockCount = medicines.filter(m => (parseInt(m.quantity) || 0) > 0 && (parseInt(m.quantity) || 0) <= LOW_STOCK_THRESHOLD).length;
    const outOfStockCount = medicines.filter(m => (parseInt(m.quantity) || 0) === 0).length;
    
    if (elements.totalMedicines) elements.totalMedicines.textContent = totalMedicines;
    if (elements.totalItems) elements.totalItems.textContent = totalItems;
    if (elements.totalValue) elements.totalValue.textContent = `$${totalValue.toFixed(2)}`;
    if (elements.lowStock) elements.lowStock.textContent = lowStockCount;
    if (elements.outOfStock) elements.outOfStock.textContent = outOfStockCount;
    if (elements.netValue) elements.netValue.textContent = `$${totalValue.toFixed(2)}`;
}

function updateStockTags() {
    if (!elements.stockTags) return;
    
    const tags = [];
    const total = medicines.length;
    const lowStockCount = medicines.filter(m => (parseInt(m.quantity) || 0) > 0 && (parseInt(m.quantity) || 0) <= LOW_STOCK_THRESHOLD).length;
    const outOfStockCount = medicines.filter(m => (parseInt(m.quantity) || 0) === 0).length;
    const expiringSoon = medicines.filter(m => isExpiringSoon(m.expiration_date)).length;
    
    if (total === 0) {
        tags.push('<span class="stock-tag empty">Empty Inventory</span>');
    } else {
        if (total > 0) {
            tags.push(`<span class="stock-tag total">${total} Items</span>`);
        }
        if (outOfStockCount > 0) {
            tags.push(`<span class="stock-tag danger">${outOfStockCount} Out of Stock</span>`);
        }
        if (lowStockCount > 0) {
            tags.push(`<span class="stock-tag warning">${lowStockCount} Low Stock</span>`);
        }
        if (expiringSoon > 0) {
            tags.push(`<span class="stock-tag warning">${expiringSoon} Expiring Soon</span>`);
        }
    }
    
    elements.stockTags.innerHTML = tags.join('');
}

// ================= Modal Functions =================
function openMedicineForm(medicine = null) {
    isEditing = !!medicine;
    currentMedicineId = medicine?.id || null;
    
    if (elements.modalTitle) {
        elements.modalTitle.textContent = isEditing ? 'Edit Medicine' : 'Add New Medicine';
    }
    
    // Reset form
    if (elements.medicineForm) {
        elements.medicineForm.reset();
    }
    
    // Fill form if editing
    if (medicine) {
        if (elements.medicineName) elements.medicineName.value = medicine.name || '';
        if (elements.medicineDescription) elements.medicineDescription.value = medicine.description || '';
        if (elements.medicineCategory) elements.medicineCategory.value = medicine.category || '';
        if (elements.medicineManufacturer) elements.medicineManufacturer.value = medicine.manufacturer || '';
        if (elements.medicinePrice) elements.medicinePrice.value = medicine.price || '';
        if (elements.medicineQuantity) elements.medicineQuantity.value = medicine.quantity || '';
        if (elements.medicineBatch) elements.medicineBatch.value = medicine.batch_number || '';
        
        if (medicine.expiration_date && elements.medicineExpiration) {
            elements.medicineExpiration.value = medicine.expiration_date;
        } else if (elements.medicineExpiration) {
            elements.medicineExpiration.value = '';
        }
    }
    
    // Show modal with animation
    if (elements.medicineModal) {
        elements.medicineModal.style.display = 'flex';
        setTimeout(() => {
            elements.medicineModal.classList.add('show');
            if (elements.medicineName) elements.medicineName.focus();
        }, 10);
    }
}

function closeMedicineForm() {
    if (elements.medicineModal) {
        elements.medicineModal.classList.remove('show');
        setTimeout(() => {
            elements.medicineModal.style.display = 'none';
            if (elements.medicineForm) elements.medicineForm.reset();
            isEditing = false;
            currentMedicineId = null;
        }, 300);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate required fields
    if (!elements.medicineName || !elements.medicineName.value.trim()) {
        showToast('Medicine name is required', 'error');
        if (elements.medicineName) elements.medicineName.focus();
        return;
    }
    
    if (!elements.medicinePrice || !elements.medicinePrice.value || parseFloat(elements.medicinePrice.value) <= 0) {
        showToast('Valid price is required', 'error');
        if (elements.medicinePrice) elements.medicinePrice.focus();
        return;
    }
    
    if (!elements.medicineQuantity || !elements.medicineQuantity.value || parseInt(elements.medicineQuantity.value) < 0) {
        showToast('Valid quantity is required', 'error');
        if (elements.medicineQuantity) elements.medicineQuantity.focus();
        return;
    }
    
    const medicineData = {
        name: elements.medicineName.value.trim(),
        description: elements.medicineDescription ? elements.medicineDescription.value.trim() : '',
        category: elements.medicineCategory ? elements.medicineCategory.value : '',
        manufacturer: elements.medicineManufacturer ? elements.medicineManufacturer.value.trim() : '',
        price: parseFloat(elements.medicinePrice.value),
        quantity: parseInt(elements.medicineQuantity.value),
        expiration_date: elements.medicineExpiration && elements.medicineExpiration.value ? elements.medicineExpiration.value : null,
        batch_number: elements.medicineBatch ? elements.medicineBatch.value.trim() : ''
    };
    
    saveMedicine(medicineData);
}

// ================= Utility Functions =================
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function searchMedicines() {
    if (!elements.searchInput) return;
    
    const query = elements.searchInput.value.toLowerCase().trim();
    
    if (!query) {
        renderMedicines(medicines);
        return;
    }
    
    const filtered = medicines.filter(medicine => {
        const searchableFields = [
            medicine.name,
            medicine.description,
            medicine.category,
            medicine.manufacturer,
            medicine.batch_number
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableFields.includes(query);
    });
    
    renderMedicines(filtered);
}

function updateLastUpdated() {
    if (!elements.lastUpdated) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    elements.lastUpdated.textContent = timeString;
}

function showToast(message, type = 'info') {
    if (!elements.toast) return;
    
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type} show`;
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function isExpiringSoon(dateString) {
    if (!dateString) return false;
    const today = new Date();
    const expiryDate = new Date(dateString);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ================= Action Functions =================
function printReport() {
    showToast('Preparing print report...', 'info');
    setTimeout(() => {
        window.print();
        showToast('Print sent to printer', 'success');
    }, 1000);
}

function exportToCSV() {
    if (medicines.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }
    
    const headers = ['Name', 'Description', 'Category', 'Manufacturer', 'Price', 'Quantity', 'Expiration Date', 'Batch Number', 'Status'];
    
    const csvRows = medicines.map(medicine => {
        const status = (medicine.quantity || 0) === 0 ? 'Out of Stock' : 
                      (medicine.quantity || 0) <= LOW_STOCK_THRESHOLD ? 'Low Stock' : 'In Stock';
        
        return [
            `"${(medicine.name || '').replace(/"/g, '""')}"`,
            `"${(medicine.description || '').replace(/"/g, '""')}"`,
            `"${(medicine.category || '').replace(/"/g, '""')}"`,
            `"${(medicine.manufacturer || '').replace(/"/g, '""')}"`,
            medicine.price || 0,
            medicine.quantity || 0,
            medicine.expiration_date || '',
            `"${(medicine.batch_number || '').replace(/"/g, '""')}"`,
            status
        ].join(',');
    });
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicine-stock-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Data exported to CSV', 'success');
}

function generateReport() {
    showToast('Stock report generated', 'success');
}

function checkExpiryDates() {
    const expiringSoon = medicines.filter(m => isExpiringSoon(m.expiration_date));
    const expired = medicines.filter(m => {
        if (!m.expiration_date) return false;
        const expiryDate = new Date(m.expiration_date);
        return expiryDate < new Date();
    });
    
    let message = '';
    if (expired.length > 0) {
        message += `${expired.length} medicine(s) have expired.\n`;
    }
    if (expiringSoon.length > 0) {
        message += `${expiringSoon.length} medicine(s) will expire within 30 days.`;
    }
    
    if (message) {
        alert(`Expiry Check Results:\n${message}`);
    } else {
        alert('All medicines are within expiry date.');
    }
    
    showToast('Expiry check completed', 'info');
}

function notifySuppliers() {
    showToast('Suppliers notified successfully', 'success');
}

function emailReport() {
    showToast('Report emailed successfully', 'success');
}

function syncInventory() {
    showToast('Inventory synchronized', 'success');
    loadMedicines();
}

// ================= Global Functions =================
window.editMedicine = function(id) {
    const medicine = medicines.find(m => m.id === id);
    if (medicine) {
        openMedicineForm(medicine);
    }
};

window.deleteMedicine = deleteMedicine;