// ---- ROLE coming from Flask / HTML ----
const CURRENT_ROLE = window.CURRENT_ROLE || "user"; // "admin" or "user"

// JS model equivalent of your Python Pharmacy class
class Pharmacy {
    constructor(Medicine_id, MedicineName, Quantity, Price, ExpiryDate, supplier) {
        this.Medicine_id = Medicine_id;
        this.MedicineName = MedicineName;
        this.Quantity = Quantity;
        this.Price = Price;
        this.ExpiryDate = new Date(ExpiryDate);
        this.supplier = supplier;
    }

    static from_dict(data) {
        return new Pharmacy(
            data.Medicine_id,
            data.MedicineName,
            data.Quantity,
            data.Price,
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

// DOM references
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

// API URLs (placeholders __ID__ are replaced when used)
const API_LIST_URL = gridEl.dataset.apiUrl;
const API_BUY_URL_TEMPLATE = gridEl.dataset.apiBuyUrl;
const API_RESTOCK_URL_TEMPLATE = gridEl.dataset.apiRestockUrl;
const API_DELETE_URL_TEMPLATE = gridEl.dataset.apiDeleteUrl;

let medicines = [];

// ---------- LOADING DATA FROM FLASK ----------

async function loadMedicines() {
    try {
        const res = await fetch(API_LIST_URL);
        const data = await res.json();
        medicines = data.map(Pharmacy.from_dict);

        renderSuppliersFilter();
        renderGrid();
    } catch (err) {
        console.error(err);
        showToast("Failed to load medicines from server.");
    }
}

// ---------- RENDERING ----------

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
                return a.Price - b.Price;
            case "price-desc":
                return b.Price - a.Price;
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

        // Role-based action buttons
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
                <span>Price: <strong>\\$${med.Price.toFixed(2)}</strong></span>
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

            <div class="medicine-meta" style="margin-top:4px;">
                <span>Expiry: <strong>${expiryDateStr}</strong></span>
                <span>${expiryLabel}</span>
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

// ---------- ACTIONS (respect role and call Flask API) ----------

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

// ---------- TOAST ----------

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

// ---------- INITIALISATION ----------

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
    newMedBtn?.addEventListener("click", () => {
        if (CURRENT_ROLE !== "admin") {
            showToast("Only admins can add new medicines.");
            return;
        }
        showToast("New Medicine form not implemented yet – connect this to your Flask route.");
    });
}

document.addEventListener("DOMContentLoaded", init);