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

// ======== DOM ELEMENTS ========
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

// API URLs
const API_LIST_URL = gridEl.dataset.apiUrl;
const API_BUY_URL_TEMPLATE = gridEl.dataset.apiBuyUrl;
const API_RESTOCK_URL_TEMPLATE = gridEl.dataset.apiRestockUrl;
const API_DELETE_URL_TEMPLATE = gridEl.dataset.apiDeleteUrl;

let medicines = [];
let cart = []; // <-- New cart array

// ======== LOAD MEDICINES ========
async function loadMedicines() {
    try {
        if (!API_LIST_URL || API_LIST_URL === 'undefined') {
            console.error("API_LIST_URL is not defined");
            showToast("Configuration error: API URL not set. Please refresh the page.");
            return;
        }
        
        const res = await fetch(API_LIST_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        if (Array.isArray(data)) {
            medicines = data.map(Pharmacy.from_dict);
            renderSuppliersFilter();
            renderGrid();
        }
    } catch (err) {
        console.error("Error loading medicines:", err);
        showToast("Failed to load medicines.");
        gridEl.innerHTML = `<div style="text-align: center; padding: 2rem; color: #dc2626;">
            <p><strong>Error loading medicines</strong></p>
        </div>`;
    }
}

// ======== RENDER FILTER ========
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

// ======== FILTER & SORT ========
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
    if (supplierFilter.value) result = result.filter(m => m.supplier === supplierFilter.value);
    if (expiryFilter.value === "near") result = result.filter(m => m.isNearExpiry() && !m.isExpired());
    else if (expiryFilter.value === "expired") result = result.filter(m => m.isExpired());

    const sortValue = sortSelect.value;
    result.sort((a, b) => {
        switch (sortValue) {
            case "name-asc": return a.MedicineName.localeCompare(b.MedicineName);
            case "name-desc": return b.MedicineName.localeCompare(a.MedicineName);
            case "price-asc": return a.price - b.price;
            case "price-desc": return b.price - a.price;
            case "quantity-asc": return a.Quantity - b.Quantity;
            case "quantity-desc": return b.Quantity - a.Quantity;
            case "expiry-asc": return a.ExpiryDate - b.ExpiryDate;
            case "expiry-desc": return b.ExpiryDate - a.ExpiryDate;
            default: return 0;
        }
    });
    return result;
}

// ======== RENDER GRID ========
function renderGrid() {
    const data = filteredAndSortedMedicines();
    gridEl.innerHTML = "";

    data.forEach(med => {
        const card = document.createElement("article");
        card.className = "medicine-card";

        const status = med.stockStatus();
        const statusText =
            status === "healthy" ? "Healthy stock" :
            status === "low" ? "Low stock" : "Critical";
        const statusClass =
            status === "healthy" ? "stock-healthy" :
            status === "low" ? "stock-low" : "stock-critical";

        const expiryLabel = med.isExpired() ? "Expired" : med.isNearExpiry() ? "Near expiry" : "Valid";
        const expiryDateStr = med.ExpiryDate.toLocaleDateString();
        const initialLetter = med.MedicineName.charAt(0).toUpperCase();

        // ==== CARD HTML with ADD TO CART button ====
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
                    <button class="btn-mini add-to-cart" data-id="${med.Medicine_id}" ${med.Quantity <= 0 || med.isExpired() ? "disabled" : ""}>
                        Add to Cart
                    </button>
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

    // ===== ADD TO CART EVENTS =====
    gridEl.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const med = medicines.find(m => m.Medicine_id === id);
            if (!med) return;
            cart.push(med);
            showToast(`${med.MedicineName} added to cart. Total items: ${cart.length}`);
        });
    });
}

// ======== FILTER SUMMARY ========
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

// ======== TOAST ========
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

// ======== INIT ========
function init() {
    loadMedicines();

    searchInput.addEventListener("input", renderGrid);
    supplierFilter.addEventListener("change", renderGrid);
    expiryFilter.addEventListener("change", renderGrid);
    sortSelect.addEventListener("change", renderGrid);

    // ===== CHECKOUT BUTTON =====
    const checkoutBtn = document.createElement("button");
    checkoutBtn.textContent = "Checkout";
    checkoutBtn.className = "btn-primary";
    checkoutBtn.style.margin = "1rem";
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) return showToast("Cart is empty!");
        let total = cart.reduce((sum, m) => sum + m.price, 0);
        alert(`Checkout ${cart.length} item(s). Total: $${total.toFixed(2)}`);
        cart = []; // clear cart
    });
    gridEl.parentElement.insertBefore(checkoutBtn, gridEl);
}

document.addEventListener("DOMContentLoaded", init);
