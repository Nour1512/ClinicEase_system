// // ============================================
// // Admin Feedback - Dark Theme + Icon Buttons
// // ============================================

// const AdminState = {
//     feedbackData: [],
//     filteredData: [],
//     currentFilter: 'all',
//     selectedReviews: new Set(),
//     searchQuery: '',
//     ratingFilter: ''
// };

// // DOM Elements
// const searchInput = document.getElementById('searchInput');
// const filterTabs = document.querySelectorAll('.filter-tab');
// const bulkActionSelect = document.getElementById('bulkActionSelect');
// const applyBulkActionBtn = document.getElementById('applyBulkActionBtn');
// const ratingFilter = document.getElementById('ratingFilter');
// const selectAllCheckbox = document.getElementById('selectAllCheckbox');
// const reviewsTableBody = document.getElementById('reviewsTableBody');
// const noReviewsMessage = document.getElementById('noReviewsMessage');
// const totalReviews = document.getElementById('totalReviews');
// const pendingReviews = document.getElementById('pendingReviews');
// const approvedReviews = document.getElementById('approvedReviews');
// const reviewModalOverlay = document.getElementById('reviewModalOverlay');
// const closeModalBtns = document.querySelectorAll('[id^="closeModalBtn"]');
// const saveReviewBtn = document.getElementById('saveReviewBtn');
// const refreshBtn = document.getElementById('refreshBtn');
// const exportAllBtn = document.getElementById('exportAllBtn');
// const bulkActionsBtn = document.getElementById('bulkActionsBtn');
// const toast = document.getElementById('toast');

// // Pagination
// const ITEMS_PER_PAGE = 10;
// let currentPage = 1;

// // ============================================
// // Initialization
// // ============================================
// document.addEventListener('DOMContentLoaded', () => {
//     initEventListeners();
//     initializeAdminData();
// });

// // ============================================
// // Fetch Data From Backend
// // ============================================
// async function initializeAdminData() {
//     try {
//         const res = await fetch('/api/admin/feedback');
//         if (!res.ok) throw new Error('Failed to fetch feedback');

//         const data = await res.json();

//         AdminState.feedbackData = data;
//         AdminState.filteredData = [...data];
//         AdminState.selectedReviews.clear();
//         currentPage = 1;

//         renderReviewsTable();
//         updateStats();
//         selectAllCheckbox.checked = false;
//     } catch (err) {
//         console.error('Error fetching feedback:', err);
//         showToast('Failed to load feedback data', 'error');
//     }
// }

// // ============================================
// // Event Listeners
// // ============================================
// function initEventListeners() {
//     searchInput.addEventListener('input', e => {
//         AdminState.searchQuery = e.target.value.toLowerCase().trim();
//         filterReviews();
//     });

//     filterTabs.forEach(tab => {
//         tab.addEventListener('click', () => {
//             filterTabs.forEach(t => t.classList.remove('active'));
//             tab.classList.add('active');
//             AdminState.currentFilter = tab.dataset.filter;
//             filterReviews();
//         });
//     });

//     ratingFilter.addEventListener('change', e => {
//         AdminState.ratingFilter = e.target.value;
//         filterReviews();
//     });

//     applyBulkActionBtn.addEventListener('click', applyBulkAction);
//     bulkActionsBtn.addEventListener('click', () => bulkActionSelect.focus());
//     selectAllCheckbox.addEventListener('change', toggleSelectAll);

//     closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
//     saveReviewBtn.addEventListener('click', saveReviewChanges);
//     refreshBtn.addEventListener('click', initializeAdminData);
//     exportAllBtn.addEventListener('click', exportAllData);
// }

// // ============================================
// // EXPORT FUNCTION — Now fully implemented (CSV)
// // ============================================
// function exportAllData() {
//     if (AdminState.feedbackData.length === 0) {
//         showToast('No data to export', 'info');
//         return;
//     }

   
//     const headers = ['ID', 'Author', 'PatientInfo', 'Rating', 'Review', 'SubmittedOn', 'Status', 'Comments'];
//     const rows = AdminState.feedbackData.map(r => [
//         r.Id || '',
//         r.Author || '',
//         r.PatientInfo || '',
//         r.Rating != null ? Number(r.Rating).toFixed(1) : '',
//         `"${(r.Review || '').replace(/"/g, '""')}"`, // escape quotes
//         r.SubmittedOn || '',
//         r.Status || '',
//         `"${(r.Comments || '').replace(/"/g, '""')}"` // escape quotes
//     ]);

   
//     let csvContent = headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');

   
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.setAttribute('href', url);
//     link.setAttribute('download', `feedback_export_${new Date().toISOString().slice(0,10)}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);

//     showToast('Exported successfully!', 'success');
// }

// // ============================================
// // Filtering
// // ============================================
// function filterReviews() {
//     let filtered = [...AdminState.feedbackData];

//     if (AdminState.currentFilter !== 'all') {
//         filtered = filtered.filter(r => r.Status === AdminState.currentFilter);
//     }

//     if (AdminState.searchQuery) {
//         filtered = filtered.filter(r =>
//             (r.Author && r.Author.toLowerCase().includes(AdminState.searchQuery)) ||
//             (r.Review && r.Review.toLowerCase().includes(AdminState.searchQuery)) ||
//             (r.PatientInfo && r.PatientInfo.toLowerCase().includes(AdminState.searchQuery))
//         );
//     }

//     if (AdminState.ratingFilter) {
//         filtered = filtered.filter(r =>
//             r.Rating != null && Math.floor(Number(r.Rating)) == Number(AdminState.ratingFilter)
//         );
//     }

//     AdminState.filteredData = filtered;
//     currentPage = 1;
//     renderReviewsTable();
//     updateStats();
// }


// function renderReviewsTable() {
//     if (!AdminState.filteredData.length) {
//         reviewsTableBody.innerHTML = '';
//         noReviewsMessage.style.display = 'block';
//         renderPagination(0);
//         return;
//     }

//     noReviewsMessage.style.display = 'none';

//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     const paginatedData = AdminState.filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

//     reviewsTableBody.innerHTML = paginatedData.map(r => `
//         <tr>
//             <td>
//                 <input type="checkbox" class="review-checkbox" data-id="${r.Id}">
//             </td>
//             <td>${escapeHtml(r.Author || '—')}</td>
//             <td>${r.Rating != null ? Number(r.Rating).toFixed(1) : '—'}</td>
//             <td>${r.Review ? escapeHtml(r.Review.substring(0, 50)) + (r.Review.length > 50 ? '...' : '') : '—'}</td>
//             <td>${escapeHtml(r.PatientInfo || '—')}</td>
//             <td>${r.SubmittedOn || '—'}</td>
//             <td>
//                 <span class="status-badge status-${r.Status || 'pending'}">
//                     ${r.Status || 'pending'}
//                 </span>
//             </td>
//             <td>
               
//                 <button class="btn-action btn-view" onclick="window.openReviewModal(${r.Id})" title="View details">
//                     <i class="fas fa-eye"></i>
//                 </button>
               
//                 <button class="btn-action btn-approve" onclick="window.updateReviewStatus(${r.Id}, 'approved')" title="Approve">
//                     <i class="fas fa-check"></i>
//                 </button>
//             </td>
//         </tr>
//     `).join('');

//     // Re-bind checkboxes
//     document.querySelectorAll('.review-checkbox').forEach(cb => {
//         cb.addEventListener('change', e => {
//             const id = Number(e.target.dataset.id);
//             if (e.target.checked) AdminState.selectedReviews.add(id);
//             else AdminState.selectedReviews.delete(id);
//             selectAllCheckbox.checked = AdminState.selectedReviews.size === AdminState.filteredData.length;
//         });
//     });

//     renderPagination(Math.ceil(AdminState.filteredData.length / ITEMS_PER_PAGE));
// }

// // ============================================
// // Pagination
// // ============================================
// function renderPagination(totalPages) {
//     const paginationContainer = document.querySelector('.pagination-controls');
//     const paginationInfo = document.querySelector('.pagination-info');

//     if (!paginationContainer) return;

//     if (totalPages <= 1) {
//         paginationContainer.innerHTML = '';
//         if (paginationInfo) {
//             paginationInfo.textContent = `Showing ${AdminState.filteredData.length} ${AdminState.filteredData.length === 1 ? 'review' : 'reviews'}`;
//         }
//         return;
//     }

//     const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
//     const end = Math.min(currentPage * ITEMS_PER_PAGE, AdminState.filteredData.length);
//     if (paginationInfo) {
//         paginationInfo.textContent = `Showing ${start} to ${end} of ${AdminState.filteredData.length} reviews`;
//     }

//     let html = '';

//     html += `<button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
//                 <i class="fas fa-chevron-left"></i>
//             </button>`;

//     const maxVisible = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisible - 1);
//     if (endPage - startPage + 1 < maxVisible) {
//         startPage = Math.max(1, endPage - maxVisible + 1);
//     }

//     if (startPage > 1) {
//         html += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
//         if (startPage > 2) html += `<span class="pagination-ellipsis">...</span>`;
//     }

//     for (let i = startPage; i <= endPage; i++) {
//         html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
//     }

//     if (endPage < totalPages) {
//         if (endPage < totalPages - 1) html += `<span class="pagination-ellipsis">...</span>`;
//         html += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
//     }

//     html += `<button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
//                 <i class="fas fa-chevron-right"></i>
//             </button>`;

//     paginationContainer.innerHTML = html;
// }

// function changePage(page) {
//     const totalPages = Math.ceil(AdminState.filteredData.length / ITEMS_PER_PAGE);
//     if (page < 1 || page > totalPages) return;
//     currentPage = page;
//     renderReviewsTable();
// }

// // ============================================
// // Modal
// // ============================================
// function openReviewModal(id) {
//     const review = AdminState.feedbackData.find(r => r.Id === id);
//     if (!review) return;

//     document.getElementById('reviewModalBody').innerHTML = `
//         <div class="modal-field">
//             <label>Patient:</label>
//             <div class="modal-value">${escapeHtml(review.Author || '—')}</div>
//         </div>
//         <div class="modal-field">
//             <label>Patient Info:</label>
//             <div class="modal-value">${escapeHtml(review.PatientInfo || '—')}</div>
//         </div>
//         <div class="modal-field">
//             <label>Rating:</label>
//             <div class="modal-value">${review.Rating != null ? Number(review.Rating).toFixed(1) : '—'}</div>
//         </div>
//         <div class="modal-field">
//             <label>Review:</label>
//             <div class="modal-value review-text">${review.Review ? escapeHtml(review.Review).replace(/\n/g, '<br>') : '—'}</div>
//         </div>
//         <div class="modal-field">
//             <label>Submitted On:</label>
//             <div class="modal-value">${review.SubmittedOn || '—'}</div>
//         </div>
//         <div class="modal-field">
//             <label>Status:</label>
//             <div class="modal-value">
//                 <span class="status-badge status-${review.Status || 'pending'}">${review.Status || 'pending'}</span>
//             </div>
//         </div>
//         <div class="modal-field">
//             <label>Admin Comments:</label>
//             <textarea id="adminComments" placeholder="Write your response or notes here..." rows="3">${escapeHtml(review.Comments || '')}</textarea>
//         </div>
//         <input type="hidden" id="currentReviewId" value="${review.Id}">
//     `;

//     reviewModalOverlay.style.display = 'flex';
// }

// function closeModal() {
//     reviewModalOverlay.style.display = 'none';
// }

// // ============================================
// // Update Review
// // ============================================
// async function saveReviewChanges() {
//     const reviewId = document.getElementById('currentReviewId')?.value;
//     const comments = document.getElementById('adminComments')?.value || '';

//     if (!reviewId) {
//         showToast('Invalid review ID', 'error');
//         return;
//     }

//     await sendUpdate({
//         Id: Number(reviewId),
//         AdminName: 'Admin',
//         Comments: comments,
//         Status: 'approved'
//     });

//     closeModal();
//     await initializeAdminData();
// }

// async function updateReviewStatus(id, status) {
//     if (!id || !status) return;

//     await sendUpdate({
//         Id: id,
//         AdminName: 'Admin',
//         Status: status
//     });

//     await initializeAdminData();
// }

// async function sendUpdate(payload) {
//     try {
//         const res = await fetch('/api/admin/feedback/update', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload)
//         });

//         if (!res.ok) throw new Error('Update failed');

//         const result = await res.json();
//         showToast(result.message || 'Updated successfully', result.success ? 'success' : 'error');
//     } catch (err) {
//         console.error('Update error:', err);
//         showToast('Failed to update review', 'error');
//     }
// }

// // ============================================
// // Bulk Actions
// // ============================================
// function toggleSelectAll() {
//     const checked = selectAllCheckbox.checked;
//     document.querySelectorAll('.review-checkbox').forEach(cb => {
//         const id = Number(cb.dataset.id);
//         if (checked) {
//             AdminState.selectedReviews.add(id);
//             cb.checked = true;
//         } else {
//             AdminState.selectedReviews.delete(id);
//             cb.checked = false;
//         }
//     });
// }

// function applyBulkAction() {
//     const action = bulkActionSelect.value;
//     if (!action) {
//         showToast('Please select an action', 'error');
//         return;
//     }
//     if (AdminState.selectedReviews.size === 0) {
//         showToast('No reviews selected', 'error');
//         return;
//     }

//     const statusMap = {
//         approve: 'approved',
//         pending: 'pending',
//         spam: 'spam',
//         trash: 'trash'
//     };
//     const status = statusMap[action] || action;

//     AdminState.selectedReviews.forEach(id => {
//         updateReviewStatus(id, status);
//     });

//     AdminState.selectedReviews.clear();
//     selectAllCheckbox.checked = false;
//     bulkActionSelect.value = '';
// }

// // ============================================
// // Stats + Toast
// // ============================================
// function updateStats() {
//     totalReviews.textContent = AdminState.feedbackData.length;
//     pendingReviews.textContent = AdminState.feedbackData.filter(r => r.Status === 'pending').length;
//     approvedReviews.textContent = AdminState.feedbackData.filter(r => r.Status === 'approved').length;

//     const updateCount = (filter, count) => {
//         const tab = document.querySelector(`.filter-tab[data-filter="${filter}"] .filter-count`);
//         if (tab) tab.textContent = count;
//     };
//     updateCount('all', AdminState.feedbackData.length);
//     updateCount('pending', pendingReviews.textContent);
//     updateCount('approved', approvedReviews.textContent);
//     updateCount('spam', AdminState.feedbackData.filter(r => r.Status === 'spam').length);
//     updateCount('trash', AdminState.feedbackData.filter(r => r.Status === 'trash').length);
// }

// function showToast(msg, type = 'info') {
//     toast.textContent = msg;
//     toast.className = `toast ${type}`;
//     toast.classList.add('visible');
//     setTimeout(() => {
//         toast.classList.remove('visible');
//     }, 3000);
// }

// // Utility
// function escapeHtml(text) {
//     if (typeof text !== 'string') return text || '';
//     const map = {
//         '&': '&amp;',
//         '<': '&lt;',
//         '>': '&gt;',
//         '"': '&quot;',
//         "'": '&#039;'
//     };
//     return text.replace(/[&<>"']/g, m => map[m]);
// }

// // Global exposure
// window.openReviewModal = openReviewModal;
// window.updateReviewStatus = updateReviewStatus;










// ============================================
// Admin Feedback - Dark Theme + Icon Buttons
// ============================================

const AdminState = {
    feedbackData: [],
    filteredData: [],
    currentFilter: 'all',
    selectedReviews: new Set(),
    searchQuery: '',
    ratingFilter: ''
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const filterTabs = document.querySelectorAll('.filter-tab');
const bulkActionSelect = document.getElementById('bulkActionSelect');
const applyBulkActionBtn = document.getElementById('applyBulkActionBtn');
const ratingFilter = document.getElementById('ratingFilter');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const reviewsTableBody = document.getElementById('reviewsTableBody');
const noReviewsMessage = document.getElementById('noReviewsMessage');
const totalReviews = document.getElementById('totalReviews');
const pendingReviews = document.getElementById('pendingReviews');
const approvedReviews = document.getElementById('approvedReviews');
const reviewModalOverlay = document.getElementById('reviewModalOverlay');
const closeModalBtns = document.querySelectorAll('[id^="closeModalBtn"]');
const saveReviewBtn = document.getElementById('saveReviewBtn');
const refreshBtn = document.getElementById('refreshBtn');
const exportAllBtn = document.getElementById('exportAllBtn');
const bulkActionsBtn = document.getElementById('bulkActionsBtn');
const toast = document.getElementById('toast');

// Pagination
const ITEMS_PER_PAGE = 10;
let currentPage = 1;

// ============================================
// API BASE URL - FIXED TO MATCH YOUR BLUEPRINT
// ============================================
const API_BASE_URL = '/admin_feedbacks/api';

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initializeAdminData();
});

// ============================================
// Fetch Data From Backend - FIXED URL
// ============================================
async function initializeAdminData() {
    try {
        const res = await fetch(`${API_BASE_URL}/feedback`); // ✅ Correct URL
        if (!res.ok) throw new Error('Failed to fetch feedback');

        const data = await res.json();

        AdminState.feedbackData = data;
        AdminState.filteredData = [...data];
        AdminState.selectedReviews.clear();
        currentPage = 1;

        renderReviewsTable();
        updateStats();
        selectAllCheckbox.checked = false;
    } catch (err) {
        console.error('Error fetching feedback:', err);
        showToast('Failed to load feedback data', 'error');
    }
}

// ============================================
// Event Listeners
// ============================================
function initEventListeners() {
    searchInput.addEventListener('input', e => {
        AdminState.searchQuery = e.target.value.toLowerCase().trim();
        filterReviews();
    });

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            AdminState.currentFilter = tab.dataset.filter;
            filterReviews();
        });
    });

    ratingFilter.addEventListener('change', e => {
        AdminState.ratingFilter = e.target.value;
        filterReviews();
    });

    applyBulkActionBtn.addEventListener('click', applyBulkAction);
    bulkActionsBtn.addEventListener('click', () => bulkActionSelect.focus());
    selectAllCheckbox.addEventListener('change', toggleSelectAll);

    closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
    saveReviewBtn.addEventListener('click', saveReviewChanges);
    refreshBtn.addEventListener('click', initializeAdminData);
    exportAllBtn.addEventListener('click', exportAllData);
}

// ============================================
// EXPORT FUNCTION — Now fully implemented (CSV)
// ============================================
function exportAllData() {
    if (AdminState.feedbackData.length === 0) {
        showToast('No data to export', 'info');
        return;
    }

    const headers = ['ID', 'Author', 'PatientInfo', 'Rating', 'Review', 'SubmittedOn', 'Status', 'Comments'];
    const rows = AdminState.feedbackData.map(r => [
        r.Id || '',
        r.Author || '',
        r.PatientInfo || '',
        r.Rating != null ? Number(r.Rating).toFixed(1) : '',
        `"${(r.Review || '').replace(/"/g, '""')}"`,
        r.SubmittedOn || '',
        r.Status || '',
        `"${(r.Comments || '').replace(/"/g, '""')}"`
    ]);

    let csvContent = headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Exported successfully!', 'success');
}

// ============================================
// Filtering
// ============================================
function filterReviews() {
    let filtered = [...AdminState.feedbackData];

    if (AdminState.currentFilter !== 'all') {
        filtered = filtered.filter(r => r.Status === AdminState.currentFilter);
    }

    if (AdminState.searchQuery) {
        filtered = filtered.filter(r =>
            (r.Author && r.Author.toLowerCase().includes(AdminState.searchQuery)) ||
            (r.Review && r.Review.toLowerCase().includes(AdminState.searchQuery)) ||
            (r.PatientInfo && r.PatientInfo.toLowerCase().includes(AdminState.searchQuery))
        );
    }

    if (AdminState.ratingFilter) {
        filtered = filtered.filter(r =>
            r.Rating != null && Math.floor(Number(r.Rating)) == Number(AdminState.ratingFilter)
        );
    }

    AdminState.filteredData = filtered;
    currentPage = 1;
    renderReviewsTable();
    updateStats();
}

function renderReviewsTable() {
    if (!AdminState.filteredData.length) {
        reviewsTableBody.innerHTML = '';
        noReviewsMessage.style.display = 'block';
        renderPagination(0);
        return;
    }

    noReviewsMessage.style.display = 'none';

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = AdminState.filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    reviewsTableBody.innerHTML = paginatedData.map(r => `
        <tr>
            <td>
                <input type="checkbox" class="review-checkbox" data-id="${r.Id}">
            </td>
            <td>${escapeHtml(r.Author || '—')}</td>
            <td>${r.Rating != null ? Number(r.Rating).toFixed(1) : '—'}</td>
            <td>${r.Review ? escapeHtml(r.Review.substring(0, 50)) + (r.Review.length > 50 ? '...' : '') : '—'}</td>
            <td>${escapeHtml(r.PatientInfo || '—')}</td>
            <td>${r.SubmittedOn || '—'}</td>
            <td>
                <span class="status-badge status-${r.Status || 'pending'}">
                    ${r.Status || 'pending'}
                </span>
            </td>
            <td>
                <button class="btn-action btn-view" onclick="window.openReviewModal(${r.Id})" title="View details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-approve" onclick="window.updateReviewStatus(${r.Id}, 'approved')" title="Approve">
                    <i class="fas fa-check"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Re-bind checkboxes
    document.querySelectorAll('.review-checkbox').forEach(cb => {
        cb.addEventListener('change', e => {
            const id = Number(e.target.dataset.id);
            if (e.target.checked) AdminState.selectedReviews.add(id);
            else AdminState.selectedReviews.delete(id);
            selectAllCheckbox.checked = AdminState.selectedReviews.size === AdminState.filteredData.length;
        });
    });

    renderPagination(Math.ceil(AdminState.filteredData.length / ITEMS_PER_PAGE));
}

// ============================================
// Pagination
// ============================================
function renderPagination(totalPages) {
    const paginationContainer = document.querySelector('.pagination-controls');
    const paginationInfo = document.querySelector('.pagination-info');

    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${AdminState.filteredData.length} ${AdminState.filteredData.length === 1 ? 'review' : 'reviews'}`;
        }
        return;
    }

    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(currentPage * ITEMS_PER_PAGE, AdminState.filteredData.length);
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${start} to ${end} of ${AdminState.filteredData.length} reviews`;
    }

    let html = '';

    html += `<button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>`;

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) html += `<span class="pagination-ellipsis">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="pagination-ellipsis">...</span>`;
        html += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    html += `<button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>`;

    paginationContainer.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(AdminState.filteredData.length / ITEMS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderReviewsTable();
}

// ============================================
// Modal
// ============================================
function openReviewModal(id) {
    const review = AdminState.feedbackData.find(r => r.Id === id);
    if (!review) return;

    document.getElementById('reviewModalBody').innerHTML = `
        <div class="modal-field">
            <label>Patient:</label>
            <div class="modal-value">${escapeHtml(review.Author || '—')}</div>
        </div>
        <div class="modal-field">
            <label>Patient Info:</label>
            <div class="modal-value">${escapeHtml(review.PatientInfo || '—')}</div>
        </div>
        <div class="modal-field">
            <label>Rating:</label>
            <div class="modal-value">${review.Rating != null ? Number(review.Rating).toFixed(1) : '—'}</div>
        </div>
        <div class="modal-field">
            <label>Review:</label>
            <div class="modal-value review-text">${review.Review ? escapeHtml(review.Review).replace(/\n/g, '<br>') : '—'}</div>
        </div>
        <div class="modal-field">
            <label>Submitted On:</label>
            <div class="modal-value">${review.SubmittedOn || '—'}</div>
        </div>
        <div class="modal-field">
            <label>Status:</label>
            <div class="modal-value">
                <span class="status-badge status-${review.Status || 'pending'}">${review.Status || 'pending'}</span>
            </div>
        </div>
        <div class="modal-field">
            <label>Admin Comments:</label>
            <textarea id="adminComments" placeholder="Write your response or notes here..." rows="3">${escapeHtml(review.Comments || '')}</textarea>
        </div>
        <input type="hidden" id="currentReviewId" value="${review.Id}">
    `;

    reviewModalOverlay.style.display = 'flex';
}

function closeModal() {
    reviewModalOverlay.style.display = 'none';
}

// ============================================
// Update Review - FIXED URL
// ============================================
async function saveReviewChanges() {
    const reviewId = document.getElementById('currentReviewId')?.value;
    const comments = document.getElementById('adminComments')?.value || '';

    if (!reviewId) {
        showToast('Invalid review ID', 'error');
        return;
    }

    await sendUpdate({
        Id: Number(reviewId),
        AdminName: 'Admin',
        Comments: comments,
        Status: 'approved'
    });

    closeModal();
    await initializeAdminData();
}

async function updateReviewStatus(id, status) {
    if (!id || !status) return;

    await sendUpdate({
        Id: id,
        AdminName: 'Admin',
        Status: status
    });

    await initializeAdminData();
}

async function sendUpdate(payload) {
    try {
        const res = await fetch(`${API_BASE_URL}/feedback/update`, { // ✅ Correct URL
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Update failed');

        const result = await res.json();
        showToast(result.message || 'Updated successfully', result.success ? 'success' : 'error');
    } catch (err) {
        console.error('Update error:', err);
        showToast('Failed to update review', 'error');
    }
}

// ============================================
// Bulk Actions
// ============================================
function toggleSelectAll() {
    const checked = selectAllCheckbox.checked;
    document.querySelectorAll('.review-checkbox').forEach(cb => {
        const id = Number(cb.dataset.id);
        if (checked) {
            AdminState.selectedReviews.add(id);
            cb.checked = true;
        } else {
            AdminState.selectedReviews.delete(id);
            cb.checked = false;
        }
    });
}

function applyBulkAction() {
    const action = bulkActionSelect.value;
    if (!action) {
        showToast('Please select an action', 'error');
        return;
    }
    if (AdminState.selectedReviews.size === 0) {
        showToast('No reviews selected', 'error');
        return;
    }

    const statusMap = {
        approve: 'approved',
        pending: 'pending',
        spam: 'spam',
        trash: 'trash'
    };
    const status = statusMap[action] || action;

    AdminState.selectedReviews.forEach(id => {
        updateReviewStatus(id, status);
    });

    AdminState.selectedReviews.clear();
    selectAllCheckbox.checked = false;
    bulkActionSelect.value = '';
}

// ============================================
// Stats + Toast
// ============================================
function updateStats() {
    totalReviews.textContent = AdminState.feedbackData.length;
    pendingReviews.textContent = AdminState.feedbackData.filter(r => r.Status === 'pending').length;
    approvedReviews.textContent = AdminState.feedbackData.filter(r => r.Status === 'approved').length;

    const updateCount = (filter, count) => {
        const tab = document.querySelector(`.filter-tab[data-filter="${filter}"] .filter-count`);
        if (tab) tab.textContent = count;
    };
    updateCount('all', AdminState.feedbackData.length);
    updateCount('pending', pendingReviews.textContent);
    updateCount('approved', approvedReviews.textContent);
    updateCount('spam', AdminState.feedbackData.filter(r => r.Status === 'spam').length);
    updateCount('trash', AdminState.feedbackData.filter(r => r.Status === 'trash').length);
}

function showToast(msg, type = 'info') {
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// Utility
function escapeHtml(text) {
    if (typeof text !== 'string') return text || '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Global exposure
window.openReviewModal = openReviewModal;
window.updateReviewStatus = updateReviewStatus;