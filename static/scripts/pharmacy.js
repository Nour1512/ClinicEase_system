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

// API URL
const API_LIST_URL = gridEl.dataset.apiUrl;

let medicines = [];
let cart = [];

// ======== SAFE CART LOAD ========
function loadCart() {
    try {
        const stored = JSON.parse(localStorage.getItem("cart"));
        cart = Array.isArray(stored) ? stored : [];
    } catch (e) {
        cart = [];
    }
}
loadCart();

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

// ======== FILTER ========
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
        const card = document.createElement("div");
        card.className = "medicine-card-container";
        card.style.border = "1px solid #e5e7eb";
        card.style.borderRadius = "12px";
        card.style.padding = "1rem";
        card.style.marginBottom = "1.5rem";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.alignItems = "center";
        card.style.background = "white";
        card.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)";

        const status = med.stockStatus();
        const statusText =
            status === "healthy" ? "Healthy stock" :
            status === "low" ? "Low stock" : "Critical";
        const statusClass =
            status === "healthy" ? "stock-healthy" :
            status === "low" ? "stock-low" : "stock-critical";

        const expiryLabel = med.isExpired() ? "Expired" : med.isNearExpiry() ? "Near expiry" : "Valid";
        const initialLetter = med.MedicineName.charAt(0).toUpperCase();

        const details = document.createElement("div");
        details.style.display = "flex";
        details.style.flexDirection = "column";
        details.style.alignItems = "center";
        details.style.gap = "8px";
        details.innerHTML = `
            <div class="badge-id">${med.Medicine_id}</div>
            <div class="medicine-card-header" style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                <div class="medicine-avatar" style="width:50px; height:50px; border-radius:50%; background:#7c3aed; color:white; display:flex; justify-content:center; align-items:center; font-weight:bold;">${initialLetter}</div>
                <div style="text-align:center;">
                    <div class="medicine-title" style="font-weight:bold; font-size:1.1rem;">${med.MedicineName}</div>
                    <div class="medicine-subtitle" style="font-size:0.9rem; color:#4b5563;">Supplier: ${med.supplier}</div>
                </div>
            </div>
            <div class="medicine-meta" style="margin-top:4px; font-size:0.95rem; text-align:center;">
                <span>Qty: <strong>${med.Quantity}</strong></span> | 
                <span>Price: <strong>$${med.price.toFixed(2)}</strong></span>
            </div>
            <div style="margin-top:4px; font-size:0.9rem; padding:2px 8px; border-radius:999px; background: ${med.isExpired() ? '#fee2e2' : med.isNearExpiry() ? '#fef3c7' : '#dcfce7'}; color: ${med.isExpired() ? '#b91c1c' : med.isNearExpiry() ? '#d97706' : '#15803d'};">
                ${expiryLabel}
            </div>
            <div class="stock-status ${statusClass}" style="margin-top:4px; font-size:0.9rem;">
                ${statusText}
            </div>
        `;

        const controls = document.createElement("div");
        controls.style.display = "flex";
        controls.style.flexDirection = "column";
        controls.style.alignItems = "center";
        controls.style.gap = "8px";
        controls.style.marginTop = "12px";

        controls.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <button class="btn-large decrement" data-id="${med.Medicine_id}" style="font-size:1.5rem; font-weight:bold; color:#7c3aed; width:40px; height:40px; border-radius:8px; border:1px solid #7c3aed; background:white; cursor:pointer;" ${med.Quantity <= 0 || med.isExpired() ? "disabled" : ""}>-</button>
                <span class="quantity" data-id="${med.Medicine_id}" style="font-size:1.25rem; min-width:30px; text-align:center;">1</span>
                <button class="btn-large increment" data-id="${med.Medicine_id}" style="font-size:1.5rem; font-weight:bold; color:#7c3aed; width:40px; height:40px; border-radius:8px; border:1px solid #7c3aed; background:white; cursor:pointer;" ${med.Quantity <= 0 || med.isExpired() ? "disabled" : ""}>+</button>
            </div>
            <button class="btn-primary add-to-cart-rounded" data-id="${med.Medicine_id}" style="border-radius:12px; font-size:1.15rem; padding:0.6rem 1.8rem; cursor:pointer;">
                Add to Cart
            </button>
        `;

        card.appendChild(details);
        card.appendChild(controls);
        gridEl.appendChild(card);
    });

    medicineCountPill.textContent = `${data.length} medicine${data.length !== 1 ? "s" : ""}`;
    medicineCountSubtitle.textContent = `Total in system: ${medicines.length}`;
    filterSummary.textContent = buildFilterSummary(data.length);
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

    // EVENT DELEGATION FOR GRID
    gridEl.addEventListener("click", handleGridClick);

    // CART POPUP AND CHECKOUT
    initCartPopup();
}

document.addEventListener("DOMContentLoaded", init);

// ======== GRID CLICK HANDLER ========
function handleGridClick(e) {
    const target = e.target;
    const id = target.dataset.id;
    const med = medicines.find(m => m.Medicine_id === id);
    if (!med) return;

    // Increment / Decrement
    if (target.classList.contains("increment")) {
        const qtyEl = gridEl.querySelector(`.quantity[data-id="${id}"]`);
        let current = parseInt(qtyEl.textContent);
        if (current < med.Quantity) qtyEl.textContent = current + 1;
    }
    if (target.classList.contains("decrement")) {
        const qtyEl = gridEl.querySelector(`.quantity[data-id="${id}"]`);
        let current = parseInt(qtyEl.textContent);
        if (current > 1) qtyEl.textContent = current - 1;
    }

    // Add to Cart
    if (target.classList.contains("add-to-cart-rounded")) {
        const qtyEl = gridEl.querySelector(`.quantity[data-id="${id}"]`);
        let qty = parseInt(qtyEl.textContent);

        let storedCart;
        try {
            storedCart = JSON.parse(localStorage.getItem("cart")) || [];
            if (!Array.isArray(storedCart)) storedCart = [];
        } catch (e) {
            storedCart = [];
        }

        const existing = storedCart.find(item => item.Medicine_id === id);
        if (existing) {
            existing.Quantity = Math.min(existing.Quantity + qty, med.Quantity);
        } else {
            storedCart.push({
                Medicine_id: med.Medicine_id,
                MedicineName: med.MedicineName,
                price: med.price,
                Quantity: qty,
                stock: med.Quantity
            });
        }

        localStorage.setItem("cart", JSON.stringify(storedCart));
        showToast(`${med.MedicineName} added to cart.`);
        updateCartBadge();
    }
}
function initCartPopup() {
    const cartContainer = document.createElement("div");
    cartContainer.style.display = "flex";
    cartContainer.style.alignItems = "center";
    cartContainer.style.justifyContent = "flex-end";
    cartContainer.style.margin = "1rem";
    cartContainer.style.position = "relative";

    const cartIcon = document.createElement("div");
    cartIcon.style.position = "relative";
    cartIcon.style.cursor = "pointer";
    cartIcon.style.display = "flex";
    cartIcon.style.alignItems = "center";
    cartIcon.style.justifyContent = "center";
    cartIcon.style.width = "56px";
    cartIcon.style.height = "56px";
    cartIcon.style.borderRadius = "12px";
    cartIcon.style.background = "#ffffff";
    cartIcon.style.border = "2px solid #e5e7eb";
    cartIcon.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
    cartIcon.style.transition = "all 0.3s ease-out";
    cartIcon.style.padding = "12px";
    
    cartIcon.innerHTML = `
        <img src="/static/imgs/shoppingCartIcon.png" alt="Shopping Cart" style="width:32px; height:32px; transition: transform 0.3s ease-out; object-fit: contain;">
        <span id="cart-count-badge" style="position:absolute; top:-6px; right:-6px; background:#7c3aed; color:white; font-size:0.75rem; font-weight:bold; width:22px; height:22px; border-radius:50%; display:flex; justify-content:center; align-items:center; box-shadow: 0 2px 6px rgba(124, 58, 237, 0.4); border: 2px solid white;">0</span>
    `;

    // Add hover effect
    cartIcon.addEventListener("mouseenter", () => {
        cartIcon.style.background = "#f9fafb";
        cartIcon.style.borderColor = "#7c3aed";
        cartIcon.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.2)";
        cartIcon.style.transform = "translateY(-2px)";
        const img = cartIcon.querySelector("img");
        if (img) img.style.transform = "scale(1.1)";
    });

    cartIcon.addEventListener("mouseleave", () => {
        cartIcon.style.background = "#ffffff";
        cartIcon.style.borderColor = "#e5e7eb";
        cartIcon.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
        cartIcon.style.transform = "translateY(0)";
        const img = cartIcon.querySelector("img");
        if (img) img.style.transform = "scale(1)";
    });

    // Create backdrop overlay for blur effect
    const backdrop = document.createElement("div");
    backdrop.style.position = "fixed";
    backdrop.style.top = "0";
    backdrop.style.left = "0";
    backdrop.style.width = "100%";
    backdrop.style.height = "100%";
    backdrop.style.background = "rgba(0, 0, 0, 0.5)";
    backdrop.style.backdropFilter = "blur(4px)";
    backdrop.style.webkitBackdropFilter = "blur(4px)";
    backdrop.style.zIndex = "9999";
    backdrop.style.display = "none";
    backdrop.addEventListener("click", () => {
        cartPopup.style.display = "none";
        backdrop.style.display = "none";
    });

    const cartPopup = document.createElement("div");
    cartPopup.style.position = "fixed";
    cartPopup.style.top = "50%";
    cartPopup.style.left = "50%";
    cartPopup.style.transform = "translate(-50%, -50%)";
    cartPopup.style.width = "400px";
    cartPopup.style.maxHeight = "80%";
    cartPopup.style.overflowY = "auto";
    cartPopup.style.background = "#7c3aed";
    cartPopup.style.color = "white";
    cartPopup.style.padding = "1rem";
    cartPopup.style.borderRadius = "12px";
    cartPopup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    cartPopup.style.display = "none";
    cartPopup.style.zIndex = "10000";

    const popupHeader = document.createElement("div");
    popupHeader.style.display = "flex";
    popupHeader.style.justifyContent = "space-between";
    popupHeader.style.alignItems = "center";
    popupHeader.style.marginBottom = "1rem";
    popupHeader.innerHTML = `<h3>Cart</h3><button style="background:#dc2626; border:none; color:white; padding:0.2rem 0.5rem; border-radius:6px; cursor:pointer;">&times;</button>`;
    const closeBtn = popupHeader.querySelector("button");
    closeBtn.addEventListener("click", () => {
        cartPopup.style.display = "none";
        backdrop.style.display = "none";
    });
    cartPopup.appendChild(popupHeader);

    const cartItemsContainer = document.createElement("div");
    cartPopup.appendChild(cartItemsContainer);

    // Total section
    const totalSection = document.createElement("div");
    totalSection.style.marginTop = "1rem";
    totalSection.style.paddingTop = "1rem";
    totalSection.style.borderTop = "2px solid rgba(255,255,255,0.3)";
    totalSection.style.display = "flex";
    totalSection.style.justifyContent = "space-between";
    totalSection.style.alignItems = "center";
    totalSection.style.fontSize = "1.2rem";
    totalSection.style.fontWeight = "bold";
    const totalLabel = document.createElement("span");
    totalLabel.textContent = "Total:";
    const totalAmount = document.createElement("span");
    totalAmount.id = "cart-total-amount";
    totalAmount.textContent = "$0.00";
    totalSection.appendChild(totalLabel);
    totalSection.appendChild(totalAmount);
    cartPopup.appendChild(totalSection);

    const checkoutPopupBtn = document.createElement("button");
    checkoutPopupBtn.textContent = "Checkout";
    checkoutPopupBtn.style.marginTop = "1rem";
    checkoutPopupBtn.style.width = "100%";
    checkoutPopupBtn.style.background = "white";
    checkoutPopupBtn.style.color = "black";
    checkoutPopupBtn.style.fontWeight = "bold";
    checkoutPopupBtn.style.border = "none";
    checkoutPopupBtn.style.borderRadius = "8px";
    checkoutPopupBtn.style.padding = "12px";
    checkoutPopupBtn.style.cursor = "pointer";
    checkoutPopupBtn.style.fontSize = "1rem";
    checkoutPopupBtn.style.textAlign = "center";
    checkoutPopupBtn.style.transition = "background 0.2s ease-out";
    checkoutPopupBtn.addEventListener("mouseenter", () => {
        checkoutPopupBtn.style.background = "#f3f4f6";
    });
    checkoutPopupBtn.addEventListener("mouseleave", () => {
        checkoutPopupBtn.style.background = "white";
    });
    checkoutPopupBtn.addEventListener("click", () => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        if (storedCart.length === 0) return showToast("Cart is empty!");
        window.location.href = "/payment-page";
    });
    cartPopup.appendChild(checkoutPopupBtn);

    cartIcon.addEventListener("click", () => {
        renderCartPopup();
        backdrop.style.display = "block";
        cartPopup.style.display = "block";
    });

    function calculateTotal(cart) {
        return cart.reduce((sum, item) => sum + (item.price * item.Quantity), 0);
    }

    function updateTotal() {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const total = calculateTotal(storedCart);
        const totalAmountEl = document.getElementById("cart-total-amount");
        if (totalAmountEl) {
            totalAmountEl.textContent = `$${total.toFixed(2)}`;
        }
    }

    function renderCartPopup() {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        cartItemsContainer.innerHTML = "";
        if (storedCart.length === 0) {
            cartItemsContainer.innerHTML = `<p style="text-align:center;">Cart is empty</p>`;
            updateTotal();
            return;
        }

        storedCart.forEach(item => {
            const medRow = document.createElement("div");
            medRow.style.display = "flex";
            medRow.style.flexDirection = "column";
            medRow.style.marginBottom = "0.75rem";
            medRow.style.background = "rgba(255,255,255,0.1)";
            medRow.style.padding = "0.6rem";
            medRow.style.borderRadius = "6px";

            const itemInfo = document.createElement("div");
            itemInfo.style.display = "flex";
            itemInfo.style.justifyContent = "space-between";
            itemInfo.style.alignItems = "center";
            itemInfo.style.marginBottom = "0.5rem";

            const itemDetails = document.createElement("div");
            itemDetails.style.flex = "1";
            itemDetails.innerHTML = `
                <strong style="display:block; margin-bottom:0.25rem;">${item.MedicineName}</strong>
                <span style="font-size:0.9rem; opacity:0.9;">$${item.price.toFixed(2)} each</span>
            `;

            const itemControls = document.createElement("div");
            itemControls.style.display = "flex";
            itemControls.style.alignItems = "center";
            itemControls.style.gap = "8px";

            const qtyControls = document.createElement("div");
            qtyControls.style.display = "flex";
            qtyControls.style.alignItems = "center";
            qtyControls.style.gap = "8px";
            qtyControls.style.marginRight = "8px";

            const decreaseBtn = document.createElement("button");
            decreaseBtn.className = "decrease";
            decreaseBtn.textContent = "-";
            decreaseBtn.style.background = "#6b21a8";
            decreaseBtn.style.color = "white";
            decreaseBtn.style.border = "none";
            decreaseBtn.style.borderRadius = "50%";
            decreaseBtn.style.width = "28px";
            decreaseBtn.style.height = "28px";
            decreaseBtn.style.fontWeight = "bold";
            decreaseBtn.style.cursor = "pointer";

            const qtySpan = document.createElement("span");
            qtySpan.className = "item-quantity";
            qtySpan.textContent = item.Quantity;
            qtySpan.style.minWidth = "30px";
            qtySpan.style.textAlign = "center";

            const increaseBtn = document.createElement("button");
            increaseBtn.className = "increase";
            increaseBtn.textContent = "+";
            increaseBtn.style.background = "#6b21a8";
            increaseBtn.style.color = "white";
            increaseBtn.style.border = "none";
            increaseBtn.style.borderRadius = "50%";
            increaseBtn.style.width = "28px";
            increaseBtn.style.height = "28px";
            increaseBtn.style.fontWeight = "bold";
            increaseBtn.style.cursor = "pointer";

            const itemPrice = document.createElement("div");
            itemPrice.className = "item-total-price";
            itemPrice.style.fontWeight = "bold";
            itemPrice.style.fontSize = "1rem";
            itemPrice.textContent = `$${(item.price * item.Quantity).toFixed(2)}`;

            const removeBtn = document.createElement("button");
            removeBtn.className = "remove";
            removeBtn.textContent = "×";
            removeBtn.style.padding = "2px 8px";
            removeBtn.style.background = "#dc2626";
            removeBtn.style.border = "none";
            removeBtn.style.borderRadius = "6px";
            removeBtn.style.color = "white";
            removeBtn.style.cursor = "pointer";
            removeBtn.style.fontSize = "1.2rem";

            qtyControls.appendChild(decreaseBtn);
            qtyControls.appendChild(qtySpan);
            qtyControls.appendChild(increaseBtn);
            itemControls.appendChild(qtyControls);
            itemControls.appendChild(itemPrice);
            itemControls.appendChild(removeBtn);

            itemInfo.appendChild(itemDetails);
            itemInfo.appendChild(itemControls);

            medRow.appendChild(itemInfo);

            decreaseBtn.addEventListener("click", () => {
                if (item.Quantity > 1) {
                    item.Quantity--;
                    qtySpan.textContent = item.Quantity;
                    itemPrice.textContent = `$${(item.price * item.Quantity).toFixed(2)}`;
                    updateCartStorage(storedCart);
                    updateTotal();
                }
            });
            increaseBtn.addEventListener("click", () => {
                if (item.Quantity < item.stock) {
                    item.Quantity++;
                    qtySpan.textContent = item.Quantity;
                    itemPrice.textContent = `$${(item.price * item.Quantity).toFixed(2)}`;
                    updateCartStorage(storedCart);
                    updateTotal();
                }
            });
            removeBtn.addEventListener("click", () => {
                const idx = storedCart.findIndex(c => c.Medicine_id === item.Medicine_id);
                if (idx !== -1) storedCart.splice(idx, 1);
                updateCartStorage(storedCart);
                renderCartPopup();
            });

            cartItemsContainer.appendChild(medRow);
        });

        updateTotal();
    }

    function updateCartStorage(updatedCart) {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        updateCartBadge();
        updateTotal();
    }

    const cartCountBadge = cartIcon.querySelector("#cart-count-badge");
    function updateCartBadge() {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalQty = storedCart.reduce((sum, item) => sum + item.Quantity, 0);
        cartCountBadge.textContent = totalQty;
    }

    cartContainer.appendChild(cartIcon);
    document.body.appendChild(backdrop);
    document.body.appendChild(cartPopup);
    gridEl.parentElement.insertBefore(cartContainer, gridEl);
    updateCartBadge();
    updateTotal();
}
