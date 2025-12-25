// ================== API CONFIG ==================
// Flask Blueprint MUST have: url_prefix="/service"
const API_BASE = "/service/api";

// ================== DOM ELEMENTS ==================
const gridEl = document.getElementById("serviceGrid");
const searchInput = document.getElementById("searchInput");
const departmentFilter = document.getElementById("departmentFilter");
const statusFilter = document.getElementById("statusFilter");
const sortSelect = document.getElementById("sortSelect");
const serviceCountPill = document.getElementById("serviceCountPill");
const addServiceBtn = document.getElementById("addServiceBtn");

const serviceModal = document.getElementById("serviceModal");
const serviceForm = document.getElementById("serviceForm");
const modalTitle = document.getElementById("modalTitle");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

let services = [];

// ================== LOAD SERVICES ==================
async function loadServices() {
    try {
        const res = await fetch(`${API_BASE}/get`);

        if (!res.ok) {
            throw new Error(`Failed to load services (${res.status})`);
        }

        services = await res.json();
        applyFiltersAndRender();

    } catch (err) {
        console.error("❌ Load error:", err);
        showToast("Failed to load services", "error");
    }
}

// ================== ADD / UPDATE ==================
async function handleFormSubmit(e) {
    e.preventDefault();

    const id = serviceForm.service_id.value;

    const payload = {
        service_id: id ? parseInt(id) : null,
        service_name: serviceForm.service_name.value.trim(),
        department: serviceForm.department.value.trim(),
        price: parseFloat(serviceForm.price.value),
        status: serviceForm.status.value
    };

    if (!payload.service_name || isNaN(payload.price)) {
        showToast("Invalid input data", "error");
        return;
    }

    const isEdit = Boolean(id);
    const url = isEdit ? `${API_BASE}/update` : `${API_BASE}/add`;
    const method = isEdit ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.error || "Save failed");
        }

        showToast(isEdit ? "Service updated" : "Service added", "success");
        closeModal();
        loadServices();

    } catch (err) {
        console.error("❌ Save error:", err);
        showToast(err.message, "error");
    }
}

// ================== DELETE ==================
async function deleteService(id) {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
        const res = await fetch(`${API_BASE}/delete/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            throw new Error("Delete failed");
        }

        showToast("Service deleted", "success");
        loadServices();

    } catch (err) {
        console.error("❌ Delete error:", err);
        showToast("Delete failed", "error");
    }
}

// ================== RENDER GRID ==================
function renderGrid(data) {
    if (!data.length) {
        gridEl.innerHTML = `
            <div class="empty-state">
                <h3>No Services Found</h3>
            </div>
        `;
        serviceCountPill.textContent = "0 services";
        return;
    }

    gridEl.innerHTML = data.map(s => `
        <div class="service-card">
            <div class="service-card-header">
                <div class="service-avatar">
                    ${s.service_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                    <div class="service-title">${s.service_name}</div>
                    <div class="service-subtitle">${s.department}</div>
                </div>
            </div>

            <div class="service-meta">
                <div>
                    Price:
                    <strong>$${Number(s.price).toFixed(2)}</strong>
                </div>
                <div>
                    Status:
                    <strong class="${s.status === "Active" ? "status-active" : "status-inactive"}">
                        ${s.status}
                    </strong>
                </div>
            </div>

            <div class="card-actions">
                <button class="btn-mini edit-btn" onclick="openEditModal(${s.service_id})">
                    Edit
                </button>
                <button class="btn-mini danger" onclick="deleteService(${s.service_id})">
                    Delete
                </button>
            </div>
        </div>
    `).join("");

    serviceCountPill.textContent = `${data.length} services`;
}

// ================== FILTERS ==================
function applyFiltersAndRender() {
    let filtered = [...services];

    if (searchInput?.value) {
        const q = searchInput.value.toLowerCase();
        filtered = filtered.filter(s =>
            s.service_name.toLowerCase().includes(q)
        );
    }

    if (departmentFilter?.value) {
        filtered = filtered.filter(s =>
            s.department === departmentFilter.value
        );
    }

    if (statusFilter?.value) {
        filtered = filtered.filter(s =>
            s.status === statusFilter.value
        );
    }

    renderGrid(filtered);
}

// ================== MODAL ==================
function openEditModal(id) {
    const s = services.find(x => x.service_id === id);
    if (!s) return;

    modalTitle.textContent = "Edit Service";
    serviceForm.service_id.value = s.service_id;
    serviceForm.service_name.value = s.service_name;
    serviceForm.department.value = s.department;
    serviceForm.price.value = s.price;
    serviceForm.status.value = s.status;

    serviceModal.classList.remove("hidden");
}

function closeModal() {
    serviceModal.classList.add("hidden");
    serviceForm.reset();
    serviceForm.service_id.value = "";
}

// ================== TOAST ==================
function showToast(message, type = "success") {
    toastMessage.textContent = message;
    toast.className = `toast visible toast-${type}`;

    setTimeout(() => {
        toast.classList.remove("visible");
    }, 3000);
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
    loadServices();

    serviceForm.addEventListener("submit", handleFormSubmit);

    addServiceBtn.addEventListener("click", () => {
        modalTitle.textContent = "Add New Service";
        serviceForm.reset();
        serviceForm.service_id.value = "";
        serviceModal.classList.remove("hidden");
    });

    document.querySelector(".btn-cancel")?.addEventListener("click", closeModal);
});
