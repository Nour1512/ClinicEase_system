const CURRENT_ROLE = window.CURRENT_ROLE || "user";

class Pharmacy {
    constructor(Medicine_id, MedicineName, Quantity, price, ExpiryDate, supplier) {
        this.Medicine_id = Medicine_id;
        this.MedicineName = MedicineName;
        this.Quantity = Quantity;
        this.price = price;
        this.ExpiryDate = new Date(ExpiryDate);
        this.supplier = supplier;
    }

    static from_dict(data) {
        return new Pharmacy(
            data.Medicine_id,
            data.MedicineName,
            data.Quantity,
            data.price,
            data.ExpiryDate,
            data.supplier
        );
    }

    isNearExpiry() {
        const today = new Date();
        const diffTime = this.ExpiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
    }

    isExpired() {
        const today = new Date();
        return this.ExpiryDate.setHours(0,0,0,0) < today.setHours(0,0,0,0);
    }

    stockStatus() {
        if (this.Quantity <= 0) return "critical";
        if (this.Quantity < 5) return "critical";
        if (this.Quantity < 15) return "low";
        return "healthy";
    }
}

const gridEl = document.getElementById("medicineGrid");
const searchInput = document.getElementById("searchInput");
const supplierFilter = document.getElementById("supplierFilter");
const expiryFilter = document.getElementById("expiryFilter");
const sortSelect = document.getElementById("sortSelect");
const medicineCountPill = document.getElementById("medicineCountPill");
const medicineCountSubtitle = document.getElementById("medicineCountSubtitle");
const filterSummary = document.getElementById("filterSummary");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

const API_LIST_URL = gridEl.dataset.apiUrl;
const API_BUY_URL_TEMPLATE = gridEl.dataset.apiBuyUrl;
const API_RESTOCK_URL_TEMPLATE = gridEl.dataset.apiRestockUrl;
const API_DELETE_URL_TEMPLATE = gridEl.dataset.apiDeleteUrl;

let medicines = [];

async function loadMedicines() {
    try {
        if (!API_LIST_URL || API_LIST_URL === 'undefined') {
            console.error("API_LIST_URL is not defined");
            showToast("Configuration error: API URL not set. Please refresh the page.");
            return;
        }
        
        const res = await fetch(API_LIST_URL);
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}: ${res.statusText}` }));
            throw new Error(errorData.error || `Server error: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (Array.isArray(data)) {
            medicines = data.map(Pharmacy.from_dict);
            renderSuppliersFilter();
            renderGrid();
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            throw new Error("Invalid response format from server");
        }
    } catch (err) {
        console.error("Error loading medicines:", err);
        const errorMsg = err.message || "Failed to load medicines from server. Please check your database connection.";
        showToast(errorMsg);
        
        // Show empty state
        if (gridEl) {
            gridEl.innerHTML = `<div style="text-align: center; padding: 2rem; color: #dc2626;">
                <p><strong>Error loading medicines</strong></p>
                <p style="font-size: 0.9em; margin-top: 0.5rem;">${errorMsg}</p>
            </div>`;
        }
    }
}

function renderSuppliersFilter() {
    supplierFilter.innerHTML = '<option value="">All Suppliers</option>';
    const suppliers = Array.from(new Set(medicines.map(m => m.supplier))).sort();
    suppliers.forEach(supplier => {
        const opt = document.createElement("option");
        opt.value = supplier;
        opt.textContent = supplier;
        supplierFilter.appendChild(opt);
    });
}

function filteredAndSortedMedicines() {
    let result = [...medicines];

    const q = searchInput.value.trim().toLowerCase();
    if (q) {
        result = result.filter(m =>
            m.MedicineName.toLowerCase().includes(q) ||
            m.Medicine_id.toLowerCase().includes(q) ||
            m.supplier.toLowerCase().includes(q)
        );
    }

    if (supplierFilter.value) {
        result = result.filter(m => m.supplier === supplierFilter.value);
    }

    if (expiryFilter.value === "near") {
        result = result.filter(m => m.isNearExpiry() && !m.isExpired());
    } else if (expiryFilter.value === "expired") {
        result = result.filter(m => m.isExpired());
    }

    const sortValue = sortSelect.value;
    result.sort((a, b) => {
        switch (sortValue) {
            case "name-asc":
                return a.MedicineName.localeCompare(b.MedicineName);
            case "name-desc":
                return b.MedicineName.localeCompare(a.MedicineName);
            case "price-asc":
                return a.price - b.price;
            case "price-desc":
                return b.price - a.price;
            case "quantity-asc":
                return a.Quantity - b.Quantity;
            case "quantity-desc":
                return b.Quantity - a.Quantity;
            case "expiry-asc":
                return a.ExpiryDate - b.ExpiryDate;
            case "expiry-desc":
                return b.ExpiryDate - a.ExpiryDate;
            default:
                return 0;
        }
    });

    return result;
}

function renderGrid() {
    const data = filteredAndSortedMedicines();
    gridEl.innerHTML = "";

    data.forEach(med => {
        const card = document.createElement("article");
        card.className = "medicine-card";

        if (med.isExpired()) {
            card.style.boxShadow = "0 0 0 1px rgba(220, 38, 38, 0.2)";
        } else if (med.isNearExpiry()) {
            card.style.boxShadow = "0 0 0 1px rgba(249, 115, 22, 0.2)";
        }

        const status = med.stockStatus();
        const statusText =
            status === "healthy"
                ? "Healthy stock"
                : status === "low"
                ? "Low stock"
                : "Critical";

        const statusClass =
            status === "healthy"
                ? "stock-healthy"
                : status === "low"
                ? "stock-low"
                : "stock-critical";

        const expiryLabel = med.isExpired()
            ? "Expired"
            : med.isNearExpiry()
            ? "Near expiry"
            : "Valid";

        const expiryDateStr = med.ExpiryDate.toLocaleDateString();
        const initialLetter = med.MedicineName.charAt(0).toUpperCase();

        let actionsHtml = "";
        if (CURRENT_ROLE === "admin") {
            actionsHtml = `
                <button class="btn-mini" data-action="restock" data-id="${med.Medicine_id}">Restock</button>
                <button class="btn-mini danger" data-action="dispose" data-id="${med.Medicine_id}">Delete</button>
            `;
        } else {
            const disabled = med.Quantity <= 0 || med.isExpired() ? "disabled" : "";
            const label = med.Quantity <= 0 ? "Out of stock" :
                          med.isExpired() ? "Expired" : "Buy";
            actionsHtml = `
                <button class="btn-mini buy" data-action="buy" data-id="${med.Medicine_id}" ${disabled}>
                    ${label}
                </button>
            `;
        }

        card.innerHTML = `
            <div class="badge-id">${med.Medicine_id}</div>
            <div class="medicine-card-header">
                <div class="medicine-avatar">${initialLetter}</div>
                <div>
                    <div class="medicine-title">${med.MedicineName}</div>
                    <div class="medicine-subtitle">Supplier: ${med.supplier}</div>
                </div>
            </div>

            <div class="medicine-meta">
                <span>Qty: <strong>${med.Quantity}</strong></span>
                <span>Price: <strong>$${med.price.toFixed(2)}</strong></span>
            </div>

            <div class="medicine-footer">
                <div class="stock-status ${statusClass}">
                    <span class="dot"></span>
                    <span>${statusText}</span>
                </div>
                <div class="card-actions">
                    ${actionsHtml}
                </div>
            </div>

            <div class="medicine-meta" style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(229, 231, 235, 0.6);">
                <span>Expiry: <strong>${expiryDateStr}</strong></span>
                <span style="padding: 2px 8px; border-radius: 999px; background: ${med.isExpired() ? '#fee2e2' : med.isNearExpiry() ? '#fef3c7' : '#dcfce7'}; color: ${med.isExpired() ? '#b91c1c' : med.isNearExpiry() ? '#d97706' : '#15803d'}; font-size: 11px;">${expiryLabel}</span>
            </div>
        `;

        gridEl.appendChild(card);
    });

    medicineCountPill.textContent = `${data.length} medicine${data.length !== 1 ? "s" : ""}`;
    medicineCountSubtitle.textContent = `Total in system: ${medicines.length}`;
    filterSummary.textContent = buildFilterSummary(data.length);

    gridEl.querySelectorAll("button[data-action]").forEach(btn => {
        btn.addEventListener("click", onCardActionClick);
    });
}

function buildFilterSummary(currentCount) {
    const parts = [];
    const sup = supplierFilter.value;
    const exp = expiryFilter.value;
    const q = searchInput.value.trim();

    if (!sup && !exp && !q) return "Showing all medicines";

    if (q) parts.push(`matching "${q}"`);
    if (sup) parts.push(`from supplier ${sup}`);
    if (exp === "near") parts.push("near expiry");
    else if (exp === "expired") parts.push("expired");

    return `Showing ${currentCount} medicine${currentCount !== 1 ? "s" : ""} ${parts.join(", ")}`;
}

async function onCardActionClick(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const med = medicines.find(m => m.Medicine_id === id);
    if (!med) return;

    try {
        if (action === "restock" || action === "dispose") {
            if (CURRENT_ROLE !== "admin") {
                showToast("You are not allowed to modify medicines.");
                return;
            }

            if (action === "restock") {
                const url = API_RESTOCK_URL_TEMPLATE.replace("__ID__", id);
                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ qty: 10 })
                });
                const data = await res.json();
                if (!res.ok || !data.ok) {
                    showToast(data.error || "Failed to restock.");
                    return;
                }
                med.Quantity = data.new_qty;
                showToast(`Restocked ${med.MedicineName}. New quantity: ${med.Quantity}`);
            } else if (action === "dispose") {
                const url = API_DELETE_URL_TEMPLATE.replace("__ID__", id);
                const res = await fetch(url, { method: "DELETE" });
                const data = await res.json();
                if (!res.ok || !data.ok) {
                    showToast(data.error || "Failed to delete.");
                    return;
                }
                const idx = medicines.findIndex(m => m.Medicine_id === id);
                if (idx !== -1) medicines.splice(idx, 1);
                showToast(`Deleted ${med.MedicineName} from inventory.`);
            }
        } else if (action === "buy") {
            if (med.Quantity <= 0 || med.isExpired()) {
                showToast("This medicine cannot be purchased right now.");
                return;
            }
            const url = API_BUY_URL_TEMPLATE.replace("__ID__", id);
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qty: 1 })
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                showToast(data.error || "Failed to buy.");
                return;
            }
            med.Quantity = data.new_qty;
            showToast(`You bought 1 unit of ${med.MedicineName}. Remaining: ${med.Quantity}`);
        }

        renderGrid();
    } catch (err) {
        console.error(err);
        showToast("Server error while processing action.");
    }
}

let toastTimeout;
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("visible");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("visible");
        toast.classList.add("hidden");
    }, 3500);
}

function init() {
    loadMedicines();

    searchInput.addEventListener("input", renderGrid);
    supplierFilter.addEventListener("change", renderGrid);
    expiryFilter.addEventListener("change", renderGrid);
    sortSelect.addEventListener("change", renderGrid);

    const aiBtn = document.getElementById("aiHelperBtn");
    aiBtn?.addEventListener("click", () => {
        showToast("AI Assistance is not connected yet, but the UI looks very intelligent!");
    });

    const newMedBtn = document.getElementById("newMedicineBtn");
    const modal = document.getElementById("newMedicineModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const newMedicineForm = document.getElementById("newMedicineForm");

    function openModal() {
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        
        const expiryDateInput = document.getElementById("expiryDate");
        if (expiryDateInput) {
            const today = new Date().toISOString().split('T')[0];
            expiryDateInput.setAttribute('min', today);
        }
    }

    function closeModal() {
        modal.classList.add("hidden");
        document.body.style.overflow = "";
        newMedicineForm.reset();
    }

    newMedBtn?.addEventListener("click", openModal);
    closeModalBtn?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);

    modal?.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
            closeModal();
        }
    });

    newMedicineForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const submitBtn = newMedicineForm.querySelector(".btn-submit");
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Adding...";

        try {
            const formData = new FormData(newMedicineForm);
            
            const medicineData = {
                MedicineName: formData.get("MedicineName"),
                Quantity: parseInt(formData.get("Quantity")),
                price: parseFloat(formData.get("price")),
                ExpiryDate: formData.get("ExpiryDate"),
                supplier: formData.get("supplier")
            };

            const res = await fetch("/pharmacy/api/medicines", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(medicineData)
            });

            const data = await res.json();

            if (!res.ok || !data.ok) {
                throw new Error(data.error || "Failed to add medicine");
            }

            showToast(`Successfully added ${medicineData.MedicineName}!`);
            closeModal();
            
            await loadMedicines();
        } catch (err) {
            console.error("Error adding medicine:", err);
            showToast(err.message || "Failed to add medicine. Please try again.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

document.addEventListener("DOMContentLoaded", init);