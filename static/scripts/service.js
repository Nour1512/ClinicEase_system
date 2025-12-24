// API endpoints
const API_BASE = '/service/api';

// DOM Elements
const gridEl = document.getElementById("serviceGrid");
const searchInput = document.getElementById("searchInput");
const departmentFilter = document.getElementById("departmentFilter");
const statusFilter = document.getElementById("statusFilter");
const sortSelect = document.getElementById("sortSelect");
const serviceCountPill = document.getElementById("serviceCountPill");
const serviceCountSubtitle = document.getElementById("serviceCountSubtitle");
const filterSummary = document.getElementById("filterSummary");
const addServiceBtn = document.getElementById("addServiceBtn");
const serviceModal = document.getElementById("serviceModal");
const serviceForm = document.getElementById("serviceForm");
const modalTitle = document.getElementById("modalTitle");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const aiHelperBtn = document.getElementById("aiHelperBtn");

// Data
let services = [];
let isEditing = false;
let currentServiceId = null;

// ================== Model ==================
class Service {
    constructor(service_id, service_name, department, price, status) {
        this.service_id = service_id;
        this.service_name = service_name;
        this.department = department;
        this.price = parseFloat(price);
        this.status = status;
    }

    static from_dict(d) {
        return new Service(
            d.service_id,
            d.service_name,
            d.department,
            d.price,
            d.status
        );
    }

    isActive() {
        return this.status === 'Active';
    }

    getStatusClass() {
        return this.isActive() ? 'status-active' : 'status-inactive';
    }
}

// ================== Load ==================
async function loadServices() {
    try {
        const res = await fetch(`${API_BASE}/get`);
        const data = await res.json();
        services = data.map(Service.from_dict);
        renderDepartmentsFilter();
        applyFiltersAndRender();
    } catch (err) {
        console.error(err);
        showToast("Failed to load services", "error");
    }
}

// ================== Filters ==================
function applyFiltersAndRender() {
    let result = [...services];
    const q = searchInput.value.trim().toLowerCase();

    if (q) {
        result = result.filter(s =>
            s.service_name.toLowerCase().includes(q) ||
            s.department.toLowerCase().includes(q)
        );
    }

    if (departmentFilter.value) {
        result = result.filter(s => s.department === departmentFilter.value);
    }

    if (statusFilter.value) {
        result = result.filter(s => s.status === statusFilter.value);
    }

    result.sort((a, b) => {
        switch (sortSelect.value) {
            case "name-asc": return a.service_name.localeCompare(b.service_name);
            case "name-desc": return b.service_name.localeCompare(a.service_name);
            case "price-asc": return a.price - b.price;
            case "price-desc": return b.price - a.price;
            default: return 0;
        }
    });

    renderGrid(result);
}

// ================== Render ==================
function renderDepartmentsFilter() {
    departmentFilter.innerHTML = '<option value="">All Departments</option>';
    [...new Set(services.map(s => s.department))].sort().forEach(d => {
        const o = document.createElement("option");
        o.value = d;
        o.textContent = d;
        departmentFilter.appendChild(o);
    });
}

function renderGrid(data) {
    if (!data.length) {
        gridEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🩺</div>
                <h3>No Services Found</h3>
                <p>Try adjusting your filters</p>
            </div>`;
        return;
    }

    gridEl.innerHTML = data.map(s => `
        <div class="service-card">
            <div class="service-card-header">
                <div class="service-avatar">${s.service_name.slice(0,2).toUpperCase()}</div>
                <div>
                    <div class="service-title">${s.service_name}</div>
                    <div class="service-subtitle">${s.department}</div>
                </div>
            </div>

            <div class="badge-id">ID: ${s.service_id}</div>

            <div class="service-meta">
                <div>
                    <div>Price</div>
                    <strong>$${s.price.toFixed(2)}</strong>
                </div>
                <div>
                    <div>Status</div>
                    <strong class="${s.getStatusClass()}">${s.status}</strong>
                </div>
            </div>

            <div class="service-footer">
                <div class="service-status">
                    <span class="dot dot-${s.isActive() ? 'success' : 'danger'}"></span>
                    ${s.status}
                </div>
                <div class="card-actions">
                    <button class="btn-mini edit-btn" data-id="${s.service_id}">Edit</button>
                    <button class="btn-mini danger delete-btn" data-id="${s.service_id}">Delete</button>
                </div>
            </div>
        </div>
    `).join('');

    serviceCountPill.textContent = `${data.length} services`;
    serviceCountSubtitle.textContent = `Total in system: ${services.length}`;
    filterSummary.textContent = "Filtered services";
}

// ================== Modal ==================
function openModal(service = null) {
    isEditing = !!service;
    currentServiceId = service ? service.service_id : null;
    modalTitle.textContent = isEditing ? "Edit Service" : "Add New Service";

    if (service) {
        serviceForm.service_id.value = service.service_id;
        serviceForm.service_name.value = service.service_name;
        serviceForm.department.value = service.department;
        serviceForm.price.value = service.price;
        serviceForm.status.value = service.status;
    } else {
        serviceForm.reset();
        serviceForm.status.value = "Active";
    }

    serviceModal.classList.remove("hidden");
}

function closeModal() {
    serviceModal.classList.add("hidden");
    serviceForm.reset();
    isEditing = false;
    currentServiceId = null;
}

// ================== Events ==================
function bindEvents() {
    searchInput.addEventListener("input", applyFiltersAndRender);
    departmentFilter.addEventListener("change", applyFiltersAndRender);
    statusFilter.addEventListener("change", applyFiltersAndRender);
    sortSelect.addEventListener("change", applyFiltersAndRender);

    addServiceBtn.addEventListener("click", () => openModal());

    gridEl.addEventListener("click", e => {
        const id = e.target.dataset.id;
        if (!id) return;
        const service = services.find(s => s.service_id == id);
        if (e.target.classList.contains("edit-btn")) openModal(service);
        if (e.target.classList.contains("delete-btn")) deleteService(id);
    });

    serviceForm.addEventListener("submit", handleFormSubmit);

    // ✅ FIX: Cancel button
    document.querySelector(".btn-cancel").addEventListener("click", closeModal);
    document.querySelector(".modal-close").addEventListener("click", closeModal);

    serviceModal.addEventListener("click", e => {
        if (e.target === serviceModal) closeModal();
    });
}

// ================== CRUD ==================
async function handleFormSubmit(e) {
    e.preventDefault();
    const data = {
        service_id: serviceForm.service_id.value,
        service_name: serviceForm.service_name.value,
        department: serviceForm.department.value,
        price: serviceForm.price.value,
        status: serviceForm.status.value
    };

    const url = isEditing ? `${API_BASE}/update` : `${API_BASE}/add`;
    const method = isEditing ? "PUT" : "POST";

    await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    showToast("Saved successfully", "success");
    closeModal();
    loadServices();
}

async function deleteService(id) {
    if (!confirm("Delete this service?")) return;
    await fetch(`${API_BASE}/delete/${id}`, { method: "DELETE" });
    showToast("Deleted", "success");
    loadServices();
}

// ================== Toast ==================
function showToast(msg, type) {
    toastMessage.textContent = msg;
    toast.className = `toast visible toast-${type}`;
    setTimeout(() => toast.classList.remove("visible"), 3000);
}

// ================== Init ==================
document.addEventListener("DOMContentLoaded", () => {
    loadServices();
    bindEvents();
});
