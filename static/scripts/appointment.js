// DOM Elements
const gridEl = document.getElementById("appointmentGrid");
const searchInput = document.getElementById("searchInput");
const doctorFilter = document.getElementById("doctorFilter");
const statusFilter = document.getElementById("statusFilter");
const sortSelect = document.getElementById("sortSelect");
const appointmentCountPill = document.getElementById("appointmentCountPill");
const filterSummary = document.getElementById("filterSummary");
const newAppointmentBtn = document.getElementById("newAppointmentBtn");
const newAppointmentModal = document.getElementById("newAppointmentModal");
const newAppointmentForm = document.getElementById("newAppointmentForm");

// API URLs (from HTML data attrs)
// const API_LIST_URL = gridEl ? gridEl.dataset.apiUrl : "/appointments/Book";
const API_LIST_URL = gridEl ? gridEl.dataset.apiUrl : "/appointments/api/appointments/role-based";
const API_DELETE_URL = gridEl ? gridEl.dataset.apiDeleteUrl : "/appointments/__ID__";

let appointments = [];

// Normalize API data
function normalizeAppointments(apiData) {
  return apiData.map(a => {
    const [date, timeRaw] = (a.appointment_date || "").split(" ");
    const time = timeRaw ? timeRaw.slice(0, 5) : "—";
    return {
      id: a.appointment_id,
      patient: a.patient_name || "Unknown",
      doctor: a.doctor_name || "Unknown",
      date: date || "—",
      time: time === "00:00" ? "All Day" : time,
      status: (a.status || "pending").toLowerCase()
    };
  });
}

// Load appointments
async function loadAppointments() {
  try {
    const res = await fetch(API_LIST_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    appointments = normalizeAppointments(await res.json());
    renderGrid();
    populateDoctorFilter();
  } catch (err) {
    console.error("Fetch failed:", err);
    if (gridEl) {
      gridEl.innerHTML = `<div style="text-align:center;padding:2rem;color:#ef4444">❌ ${err.message}</div>`;
    }
  }
}

// Render grid
function renderGrid() {
  const filtered = filterAppointments();
  
  if (!gridEl) return; // Exit if grid element doesn't exist
  
  gridEl.innerHTML = filtered.length 
    ? filtered.map(app => `
        <div class="medicine-card">
          <div class="badge-id">#${app.id}</div>
          <div class="medicine-card-header">
            <div class="medicine-avatar">${app.patient[0]?.toUpperCase() || "?"}</div>
            <div>
              <div class="medicine-title">${escapeHtml(app.patient)}</div>
              <div class="medicine-subtitle">Dr. ${escapeHtml(app.doctor)}</div>
            </div>
          </div>
          <div class="medicine-meta">
            <span><strong>Date:</strong> ${app.date}</span>
            <span><strong>Time:</strong> ${app.time}</span>
          </div>
          <div class="medicine-footer">
            <div class="stock-status ${statusClass(app.status)}">
              <span class="dot"></span> ${capitalize(app.status)}
            </div>
            <button class="btn-mini danger" data-id="${app.id}">Delete</button>
          </div>
        </div>
      `).join("")
    : `<div style="text-align:center;padding:3rem;color:#6b7280">No appointments found</div>`;

  if (appointmentCountPill) {
    appointmentCountPill.textContent = `${filtered.length} appointment${filtered.length === 1 ? "" : "s"}`;
  }
  
  if (filterSummary) {
    filterSummary.textContent = buildFilterSummary(filtered.length);
  }
}

// Escape HTML
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, m => 
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );
}

// Filter logic
function filterAppointments() {
  return [...appointments]
    .filter(a => {
      const q = searchInput?.value.trim().toLowerCase() || '';
      return !q || 
        a.patient.toLowerCase().includes(q) || 
        a.doctor.toLowerCase().includes(q) ||
        a.id.toString().includes(q);
    })
    .filter(a => !doctorFilter?.value || a.doctor === doctorFilter.value)
    .filter(a => !statusFilter?.value || a.status === statusFilter.value)
    .sort(sortAppointments);
}

// Sort logic
function sortAppointments(a, b) {
  const aTime = new Date(`${a.date}T${a.time.replace('All Day', '00:00')}:00`);
  const bTime = new Date(`${b.date}T${b.time.replace('All Day', '00:00')}:00`);
  switch (sortSelect?.value || 'date-desc') {
    case "date-asc": return aTime - bTime;
    case "date-desc": return bTime - aTime;
    case "name-asc": return a.patient.localeCompare(b.patient);
    case "name-desc": return b.patient.localeCompare(a.patient);
    default: return 0;
  }
}

// Status styling
function statusClass(status) {
  return ({ 
    pending: "stock-warning", 
    scheduled: "stock-warning", 
    completed: "stock-healthy", 
    cancelled: "stock-danger" 
  }[status] || "stock-warning");
}

// UI helpers
function populateDoctorFilter() {
  if (!doctorFilter) return;
  
  const doctors = [...new Set(appointments.map(a => a.doctor))].sort();
  doctorFilter.innerHTML = '<option value="">All Doctors</option>' + 
    doctors.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
}

function buildFilterSummary(count) {
  const parts = [];
  if (searchInput?.value) parts.push(`"${searchInput.value}"`);
  if (doctorFilter?.value) parts.push(`Doctor: ${doctorFilter.value}`);
  if (statusFilter?.value) parts.push(`Status: ${statusFilter.value}`);
  return parts.length 
    ? `Showing ${count} appointment${count === 1 ? "" : "s"} for ${parts.join(", ")}`
    : "Showing all appointments";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Modal
function openModal() { 
  if (newAppointmentModal) {
    newAppointmentModal.classList.remove("hidden");
  }
}
function closeModal() { 
  if (newAppointmentModal) {
    newAppointmentModal.classList.add("hidden"); 
  }
  if (newAppointmentForm) {
    newAppointmentForm.reset(); 
  }
}

// Create appointment
async function submitNewAppointment(e) {
  e.preventDefault();
  if (!newAppointmentForm) return;
  
  const formData = new FormData(newAppointmentForm);
  const dt = new Date(formData.get("appointment_date"));
  if (isNaN(dt)) return showToast("Invalid date");

  const payload = {
    patient_id: parseInt(formData.get("patient_id")),
    doctor_id: parseInt(formData.get("doctor_id")),
    appointment_date: dt.toISOString().slice(0, 19).replace("T", " "),
    notes: formData.get("notes") || ""
  };

  try {
    const res = await fetch(API_LIST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed");
    closeModal();
    showToast("✅ Appointment created!");
    loadAppointments();
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
}

// Delete appointment
async function deleteAppointment(id) {
  if (!confirm(`Delete appointment #${id}?`)) return;
  try {
    const url = API_DELETE_URL.replace("__ID__", id);
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    showToast("🗑️ Deleted");
    loadAppointments();
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
}

// Toast
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  
  t.querySelector("#toastMessage").textContent = msg;
  t.classList.remove("hidden", "visible");
  setTimeout(() => t.classList.add("visible"), 10);
  setTimeout(() => t.classList.remove("visible"), 2900);
}

// Init
function init() {
  // Only initialize if required elements exist
  if (!gridEl) {
    console.warn("Appointment grid element not found");
    return;
  }
  
  loadAppointments();
  
  // Event listeners with null checks
  const filterElements = [searchInput, doctorFilter, statusFilter, sortSelect];
  filterElements.forEach(el => {
    if (el) {
      el.addEventListener("input", renderGrid);
    }
  });
  
  if (newAppointmentBtn) {
    newAppointmentBtn.addEventListener("click", openModal);
  }
  
  const closeButtons = [
    document.getElementById("closeModalBtn"),
    document.getElementById("cancelBtn")
  ];
  closeButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener("click", closeModal);
    }
  });
  
  if (newAppointmentForm) {
    newAppointmentForm.addEventListener("submit", submitNewAppointment);
  }
  
  if (gridEl) {
    gridEl.addEventListener("click", e => {
      if (e.target.classList.contains("danger")) {
        deleteAppointment(e.target.dataset.id);
      }
    });
  }
}

// Wait for DOM to load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
