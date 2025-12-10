// Service Management System
let allServices = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadServices();
    setupEventListeners();
});

// ========== LOAD SERVICES ==========
async function loadServices() {
    try {
        console.log('📡 Loading services from API...');
        
        const response = await fetch('/service/api/get');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allServices = await response.json();
        console.log(`✅ Loaded ${allServices.length} services`);
        
        renderServices(allServices);
        updateServiceCount();
        
    } catch (error) {
        console.error('❌ Error loading services:', error);
        showToast('Failed to load services. Please refresh the page.', 'error');
    }
}

// ========== RENDER SERVICES ==========
function renderServices(services) {
    const grid = document.getElementById('serviceGrid');
    
    if (!grid) {
        console.error('❌ Service grid element not found!');
        return;
    }
    
    if (services.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🩺</div>
                <h3>No Services Found</h3>
                <p>Add your first medical service to get started</p>
                <button class="btn-primary" onclick="openNewServiceModal()">
                    <span class="icon">＋</span>
                    <span>Add Service</span>
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = services.map(service => `
        <div class="service-card" 
             data-id="${service.service_id}" 
             data-name="${service.service_name}" 
             data-department="${service.department}" 
             data-price="${service.price}" 
             data-status="${service.status}">
            
            <div class="service-card-header">
                <div class="service-avatar">
                    ${service.service_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <div class="service-title">${service.service_name}</div>
                    <div class="service-subtitle">${service.department}</div>
                </div>
            </div>
            
            <div class="badge-id">ID: ${service.service_id}</div>
            
            <div class="service-meta">
                <div>
                    <div>Price</div>
                    <strong>$${parseFloat(service.price).toFixed(2)}</strong>
                </div>
                <div>
                    <div>Status</div>
                    <strong class="status-${service.status.toLowerCase()}">${service.status}</strong>
                </div>
            </div>

            <div class="service-footer">
                <div class="service-status">
                    <span class="dot dot-${service.status === 'Active' ? 'success' : 'warning'}"></span>
                    ${service.status}
                </div>
                <div class="card-actions">
                    <button class="btn-mini" onclick="editService(${service.service_id})">
                        Edit
                    </button>
                    <button class="btn-mini danger" onclick="deleteService(${service.service_id})">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========== FORM SUBMISSION ==========
async function saveService(event) {
    event.preventDefault();
    
    console.log('📝 Saving service...');
    
    // Get form data
    const formData = {
        service_id: document.getElementById('service_id').value,
        service_name: document.getElementById('service_name').value.trim(),
        department: document.getElementById('department').value,
        price: parseFloat(document.getElementById('price').value),
        status: document.getElementById('status').value
    };
    
    // Validation
    if (!formData.service_name || !formData.department || !formData.price || !formData.status) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    if (formData.price <= 0) {
        showToast('Price must be greater than 0', 'warning');
        return;
    }
    
    try {
        const isEdit = !!formData.service_id;
        const url = isEdit ? '/service/api/update' : '/service/api/add';
        const method = isEdit ? 'PUT' : 'POST';
        
        console.log(`📤 Sending ${method} request to ${url}`, formData);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Save failed');
        }
        
        const data = await response.json();
        console.log('✅ Service saved:', data);
        
        showToast(data.message || 'Service saved successfully', 'success');
        
        // Close modal and refresh data
        closeServiceModal();
        await loadServices();
        
        // Verify in database
        await verifyDatabase();
        
    } catch (error) {
        console.error('❌ Error saving service:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

// ========== VERIFY DATABASE ==========
async function verifyDatabase() {
    try {
        console.log('🔍 Verifying database...');
        const response = await fetch('/service/api/get');
        const services = await response.json();
        console.log(`📊 Database now has ${services.length} services`);
    } catch (error) {
        console.error('❌ Error verifying database:', error);
    }
}

// ========== DELETE SERVICE ==========
async function deleteService(serviceId) {
    if (!confirm('Are you sure you want to delete this service?')) {
        return;
    }
    
    try {
        console.log(`🗑️ Deleting service ${serviceId}...`);
        
        const response = await fetch(`/service/api/delete/${serviceId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Delete failed');
        }
        
        const data = await response.json();
        console.log('✅ Service deleted:', data);
        
        showToast(data.message || 'Service deleted successfully', 'success');
        await loadServices();
        
    } catch (error) {
        console.error('❌ Error deleting service:', error);
        showToast('Error deleting service', 'error');
    }
}

// ========== MODAL FUNCTIONS ==========
function openNewServiceModal() {
    console.log('📋 Opening new service modal...');
    
    document.getElementById('modalTitle').textContent = 'Add New Service';
    document.getElementById('service_id').value = '';
    document.getElementById('service_name').value = '';
    document.getElementById('department').value = '';
    document.getElementById('price').value = '';
    document.getElementById('status').value = '';
    
    document.getElementById('serviceModal').classList.remove('hidden');
}

function editService(serviceId) {
    console.log(`✏️ Editing service ${serviceId}...`);
    
    const service = allServices.find(s => s.service_id === serviceId);
    if (!service) {
        showToast('Service not found', 'error');
        return;
    }
    
    document.getElementById('modalTitle').textContent = 'Edit Service';
    document.getElementById('service_id').value = service.service_id;
    document.getElementById('service_name').value = service.service_name;
    document.getElementById('department').value = service.department;
    document.getElementById('price').value = service.price;
    document.getElementById('status').value = service.status;
    
    document.getElementById('serviceModal').classList.remove('hidden');
}

function closeServiceModal() {
    console.log('🔒 Closing modal...');
    document.getElementById('serviceModal').classList.add('hidden');
    document.getElementById('serviceForm').reset();
}

// ========== FILTER & SORT ==========
function filterServices() {
    const department = document.getElementById('departmentFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    let filtered = allServices;
    
    if (department) {
        filtered = filtered.filter(s => s.department === department);
    }
    
    if (status) {
        filtered = filtered.filter(s => s.status === status);
    }
    
    renderServices(filtered);
    updateFilterSummary(filtered.length);
}

function sortServices() {
    const sortBy = document.getElementById('sortSelect').value;
    let sorted = [...allServices];
    
    switch(sortBy) {
        case 'name-asc':
            sorted.sort((a, b) => a.service_name.localeCompare(b.service_name));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.service_name.localeCompare(a.service_name));
            break;
        case 'price-asc':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'recent':
        default:
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
    }
    
    renderServices(sorted);
}

function searchServices() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        renderServices(allServices);
        return;
    }
    
    const filtered = allServices.filter(service => 
        service.service_name.toLowerCase().includes(searchTerm) ||
        service.department.toLowerCase().includes(searchTerm)
    );
    
    renderServices(filtered);
    updateFilterSummary(filtered.length);
}

// ========== HELPER FUNCTIONS ==========
function updateServiceCount() {
    const countElement = document.getElementById('serviceCountPill');
    if (countElement) {
        countElement.textContent = `${allServices.length} services`;
    }
}

function updateFilterSummary(count) {
    const summaryElement = document.getElementById('filterSummary');
    if (summaryElement) {
        if (count === allServices.length) {
            summaryElement.textContent = 'Showing all services';
        } else {
            summaryElement.textContent = `Showing ${count} of ${allServices.length} services`;
        }
    }
}

function showAIAssistance() {
    showToast('AI Assistance is coming soon!', 'info');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) {
        console.error('Toast elements not found!');
        return;
    }
    
    toastMessage.textContent = message;
    toast.className = `toast visible toast-${type}`;
    
    setTimeout(() => {
        toast.classList.remove('visible');
        toast.classList.remove(`toast-${type}`);
    }, 3000);
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Form submission
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', saveService);
        console.log('✅ Form event listener attached');
    } else {
        console.error('❌ Service form not found!');
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', closeServiceModal);
    });
    
    // Close modal on outside click
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeServiceModal();
            }
        });
    }
    
    // Real-time search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(searchServices, 300);
        });
    }
    
    // Filter and sort changes
    document.getElementById('departmentFilter')?.addEventListener('change', filterServices);
    document.getElementById('statusFilter')?.addEventListener('change', filterServices);
    document.getElementById('sortSelect')?.addEventListener('change', sortServices);
    
    console.log('✅ All event listeners attached');
}

// ========== GLOBAL FUNCTIONS (for HTML onclick) ==========
window.openNewServiceModal = openNewServiceModal;
window.editService = editService;
window.deleteService = deleteService;
window.closeServiceModal = closeServiceModal;
window.showAIAssistance = showAIAssistance;
window.filterServices = filterServices;
window.sortServices = sortServices;
window.searchServices = searchServices;