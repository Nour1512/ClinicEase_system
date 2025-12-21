class Doctor {
    constructor(doctor_id, full_name, specialty, phone, availability, rating, email, price) {
        this.doctor_id = doctor_id;
        this.full_name = full_name;
        this.specialty = specialty;
        this.phone = phone;
        this.availability = availability;
        this.rating = rating || 0.0;
        this.email = email;
        this.price = price || 0.0;
    }

    static from_dict(data) {
        return new Doctor(
            data.doctor_id,
            data.full_name,
            data.specialty,
            data.phone,
            data.availability,
            data.rating,
            data.email,
            data.price
        );
    }

    isAvailable() {
        return this.availability && this.availability.toLowerCase().includes('available');
    }

    getAvailabilityStatus() {
        if (!this.availability) return "unknown";
        const avail = this.availability.toLowerCase();
        if (avail.includes('available') || avail.includes('free')) return "available";
        if (avail.includes('busy') || avail.includes('occupied')) return "busy";
        return "unknown";
    }
}

// ======== DOM ELEMENTS ========
const gridEl = document.getElementById("doctorGrid");
const searchInput = document.getElementById("searchInput");
const specialtyFilter = document.getElementById("specialtyFilter");
const availabilityFilter = document.getElementById("availabilityFilter");
const sortSelect = document.getElementById("sortSelect");
const doctorCountPill = document.getElementById("doctorCountPill");
const doctorCountSubtitle = document.getElementById("doctorCountSubtitle");
const filterSummary = document.getElementById("filterSummary");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

// API URL
const API_LIST_URL = gridEl.dataset.apiUrl;

let doctors = [];

// ======== LOAD DOCTORS ========
async function loadDoctors() {
    try {
        if (!API_LIST_URL || API_LIST_URL === 'undefined') {
            console.error("API_LIST_URL is not defined");
            showToast("Configuration error: API URL not set. Please refresh the page.");
            return;
        }
        
        const res = await fetch(API_LIST_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        if (data.success && Array.isArray(data.doctors)) {
            doctors = data.doctors.map(Doctor.from_dict);
            renderSpecialtyFilter();
            renderGrid();
        } else if (Array.isArray(data)) {
            // Fallback if API returns array directly
            doctors = data.map(Doctor.from_dict);
            renderSpecialtyFilter();
            renderGrid();
        }
    } catch (err) {
        console.error("Error loading doctors:", err);
        showToast("Failed to load doctors.");
        gridEl.innerHTML = `<div style="text-align: center; padding: 2rem; color: #dc2626;">
            <p><strong>Error loading doctors</strong></p>
        </div>`;
    }
}

// ======== FILTER ========
function renderSpecialtyFilter() {
    specialtyFilter.innerHTML = '<option value="">All Specialties</option>';
    const specialties = Array.from(new Set(doctors.map(d => d.specialty).filter(s => s))).sort();
    specialties.forEach(specialty => {
        const opt = document.createElement("option");
        opt.value = specialty;
        opt.textContent = specialty;
        specialtyFilter.appendChild(opt);
    });
}

// ======== FILTER & SORT ========
function filteredAndSortedDoctors() {
    let result = [...doctors];
    const q = searchInput.value.trim().toLowerCase();
    if (q) {
        result = result.filter(d =>
            d.full_name.toLowerCase().includes(q) ||
            d.specialty.toLowerCase().includes(q) ||
            (d.email && d.email.toLowerCase().includes(q))
        );
    }
    if (specialtyFilter.value) {
        result = result.filter(d => d.specialty === specialtyFilter.value);
    }
    if (availabilityFilter.value) {
        if (availabilityFilter.value === "available") {
            result = result.filter(d => d.getAvailabilityStatus() === "available");
        } else if (availabilityFilter.value === "busy") {
            result = result.filter(d => d.getAvailabilityStatus() === "busy");
        }
    }

    const sortValue = sortSelect.value;
    result.sort((a, b) => {
        switch (sortValue) {
            case "name-asc": return a.full_name.localeCompare(b.full_name);
            case "name-desc": return b.full_name.localeCompare(a.full_name);
            case "rating-asc": return a.rating - b.rating;
            case "rating-desc": return b.rating - a.rating;
            case "price-asc": return a.price - b.price;
            case "price-desc": return b.price - a.price;
            default: return 0;
        }
    });
    return result;
}

// ======== RENDER GRID ========
function renderGrid() {
    const data = filteredAndSortedDoctors();
    gridEl.innerHTML = "";

    data.forEach(doctor => {
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

        const availabilityStatus = doctor.getAvailabilityStatus();
        const availabilityText =
            availabilityStatus === "available" ? "Available" :
            availabilityStatus === "busy" ? "Busy" : "";
        const availabilityClass =
            availabilityStatus === "available" ? "stock-healthy" :
            availabilityStatus === "busy" ? "stock-low" : "stock-critical";

        const initialLetter = doctor.full_name.charAt(0).toUpperCase();
        const ratingStars = "⭐".repeat(Math.floor(doctor.rating)) + (doctor.rating % 1 >= 0.5 ? "½" : "");

        const details = document.createElement("div");
        details.style.display = "flex";
        details.style.flexDirection = "column";
        details.style.alignItems = "center";
        details.style.gap = "8px";
        
        let availabilityBadgeHTML = '';
        if (availabilityText) {
            availabilityBadgeHTML = `<div style="margin-top:4px; font-size:0.9rem; padding:2px 8px; border-radius:999px; background: ${availabilityStatus === 'available' ? '#dcfce7' : '#fee2e2'}; color: ${availabilityStatus === 'available' ? '#15803d' : '#b91c1c'};">
                ${availabilityText}
            </div>`;
        }
        
        details.innerHTML = `
            <div class="badge-id">ID: ${doctor.doctor_id}</div>
            <div class="medicine-card-header" style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                <div class="medicine-avatar" style="width:50px; height:50px; border-radius:50%; background:#7c3aed; color:white; display:flex; justify-content:center; align-items:center; font-weight:bold;">${initialLetter}</div>
                <div style="text-align:center;">
                    <div class="medicine-title" style="font-weight:bold; font-size:1.1rem;">${doctor.full_name}</div>
                    <div class="medicine-subtitle" style="font-size:0.9rem; color:#4b5563;">${doctor.specialty || 'General Practitioner'}</div>
                </div>
            </div>
            <div class="medicine-meta" style="margin-top:4px; font-size:0.95rem; text-align:center;">
                <span>Rating: <strong>${doctor.rating.toFixed(1)}</strong> ${ratingStars}</span> | 
                <span>Price: <strong>$${doctor.price.toFixed(2)}</strong></span>
            </div>
            ${availabilityBadgeHTML}
            <div class="stock-status ${availabilityClass}" style="margin-top:4px; font-size:0.9rem;">
                ${doctor.availability || 'Not specified'}
            </div>
        `;

        card.appendChild(details);
        gridEl.appendChild(card);
    });

    doctorCountPill.textContent = `${data.length} doctor${data.length !== 1 ? "s" : ""}`;
    doctorCountSubtitle.textContent = `Total in system: ${doctors.length}`;
    filterSummary.textContent = buildFilterSummary(data.length);
}

// ======== FILTER SUMMARY ========
function buildFilterSummary(currentCount) {
    const parts = [];
    const spec = specialtyFilter.value;
    const avail = availabilityFilter.value;
    const q = searchInput.value.trim();
    if (!spec && !avail && !q) return "Showing all doctors";
    if (q) parts.push(`matching "${q}"`);
    if (spec) parts.push(`specialty: ${spec}`);
    if (avail === "available") parts.push("available");
    else if (avail === "busy") parts.push("busy");
    return `Showing ${currentCount} doctor${currentCount !== 1 ? "s" : ""} ${parts.join(", ")}`;
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
    loadDoctors();

    searchInput.addEventListener("input", renderGrid);
    specialtyFilter.addEventListener("change", renderGrid);
    availabilityFilter.addEventListener("change", renderGrid);
    sortSelect.addEventListener("change", renderGrid);
}

document.addEventListener("DOMContentLoaded", init);