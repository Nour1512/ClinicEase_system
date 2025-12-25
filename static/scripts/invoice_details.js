// Invoice Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const invoiceGrid = document.getElementById('invoiceGrid');
    const invoiceModal = document.getElementById('invoiceModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const newInvoiceBtn = document.getElementById('newInvoiceBtn');
    const invoiceForm = document.getElementById('invoiceForm');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const invoiceCount = document.getElementById('invoiceCount');
    const filterSummary = document.getElementById('filterSummary');
    
    // Event Listeners
    if (newInvoiceBtn) {
        newInvoiceBtn.addEventListener('click', openModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }
    
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Initialize
    initializeInvoices();
    updateInvoiceCount();
    
    // AI Assistant Button
    const aiAssistantBtn = document.getElementById('aiAssistantBtn');
    if (aiAssistantBtn) {
        aiAssistantBtn.addEventListener('click', function() {
            showToast('AI Assistant activated! How can I help with invoices?', 'info');
        });
    }
    
    // Functions
    function openModal() {
        invoiceModal.classList.remove('hidden');
        // Set default invoice number
        const invoiceNumberInput = document.getElementById('invoiceNumber');
        if (invoiceNumberInput && invoiceNumberInput.value === '') {
            const count = document.querySelectorAll('.invoice-card').length + 1;
            invoiceNumberInput.value = `INV-${count.toString().padStart(3, '0')}`;
        }
        // Set today's date as default for issued date
        const issuedDateInput = document.getElementById('issuedDate');
        if (issuedDateInput) {
            const today = new Date().toISOString().split('T')[0];
            issuedDateInput.value = today;
        }
    }
    
    function closeModal() {
        invoiceModal.classList.add('hidden');
        invoiceForm.reset();
    }
    
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        filterInvoices(searchTerm, statusValue);
    }
    
    function handleFilter() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        filterInvoices(searchTerm, statusValue);
    }
    
    function filterInvoices(searchTerm = '', statusValue = '') {
        const cards = document.querySelectorAll('.invoice-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const clientName = card.querySelector('.invoice-title')?.textContent.toLowerCase() || '';
            const invoiceNumber = card.querySelector('.invoice-subtitle')?.textContent.toLowerCase() || '';
            const status = card.querySelector('.invoice-status')?.textContent.trim() || '';
            
            const matchesSearch = clientName.includes(searchTerm) || invoiceNumber.includes(searchTerm);
            const matchesStatus = !statusValue || status === statusValue;
            
            if (matchesSearch && matchesStatus) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        updateDisplayCount(visibleCount, statusValue);
    }
    
    function updateDisplayCount(count, status) {
        if (invoiceCount) {
            invoiceCount.textContent = `${count} invoice${count !== 1 ? 's' : ''}`;
        }
        
        if (filterSummary) {
            if (status) {
                filterSummary.textContent = `Showing ${status.toLowerCase()} invoices`;
            } else {
                filterSummary.textContent = 'Showing all invoices';
            }
        }
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const clientName = document.getElementById('clientName').value.trim();
        const invoiceNumber = document.getElementById('invoiceNumber').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const status = document.getElementById('status').value;
        const issuedDate = document.getElementById('issuedDate').value;
        const dueDate = document.getElementById('dueDate').value;
        
        // Validation
        if (!clientName) {
            showToast('Please enter client name', 'error');
            return;
        }
        
        if (isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }
        
        // Create new invoice
        createInvoice({
            clientName,
            invoiceNumber: invoiceNumber || generateInvoiceNumber(),
            amount,
            status,
            issuedDate,
            dueDate
        });
        
        closeModal();
    }
    
    function createInvoice(invoiceData) {
        // Generate new ID
        const existingCards = document.querySelectorAll('.invoice-card');
        const newId = existingCards.length + 1;
        
        // Create card element
        const card = document.createElement('div');
        card.className = 'invoice-card';
        card.dataset.id = newId;
        card.dataset.client = invoiceData.clientName.toLowerCase();
        card.dataset.status = invoiceData.status.toLowerCase();
        card.dataset.amount = invoiceData.amount;
        
        // Get initials
        const initials = getInitials(invoiceData.clientName);
        
        // Determine status class
        let statusClass = 'status-pending';
        let statusText = 'Pending';
        if (invoiceData.status === 'Paid') {
            statusClass = 'status-paid';
            statusText = 'Paid';
        } else if (invoiceData.status === 'Overdue') {
            statusClass = 'status-overdue';
            statusText = 'Overdue';
        }
        
        // Format date
        const formattedDueDate = invoiceData.dueDate ? formatDate(invoiceData.dueDate) : 'Not set';
        
        card.innerHTML = `
            <div class="invoice-card-header">
                <div class="invoice-avatar">${initials}</div>
                <div>
                    <div class="invoice-title">${invoiceData.clientName}</div>
                    <div class="invoice-subtitle">${invoiceData.invoiceNumber}</div>
                </div>
            </div>
            <div class="badge-id">ID: ${newId}</div>
            <div class="invoice-meta">
                <div>Amount <strong>$${invoiceData.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></div>
                <div>Due Date <strong>${formattedDueDate}</strong></div>
            </div>
            <div class="invoice-footer">
                <div class="invoice-status ${statusClass}">
                    <span class="dot"></span> ${statusText}
                </div>
                <div class="card-actions">
                    <button class="btn-mini view-btn">View</button>
                    <button class="btn-mini danger delete-btn">Delete</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.delete-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            deleteInvoice(card);
        });
        
        card.querySelector('.view-btn').addEventListener('click', function() {
            viewInvoice(invoiceData);
        });
        
        // Add to grid
        invoiceGrid.prepend(card);
        
        // Update count and show success
        updateInvoiceCount();
        filterInvoices(searchInput.value.toLowerCase(), statusFilter.value);
        showToast(`Invoice ${invoiceData.invoiceNumber} created successfully!`, 'success');
    }
    
    function deleteInvoice(card) {
        const clientName = card.querySelector('.invoice-title').textContent;
        const invoiceNumber = card.querySelector('.invoice-subtitle').textContent;
        
        if (confirm(`Are you sure you want to delete invoice ${invoiceNumber} for ${clientName}?`)) {
            card.remove();
            updateInvoiceCount();
            filterInvoices(searchInput.value.toLowerCase(), statusFilter.value);
            showToast(`Invoice ${invoiceNumber} deleted`, 'success');
        }
    }
    
    function viewInvoice(invoice) {
        showToast(`Viewing invoice: ${invoice.invoiceNumber} - ${invoice.clientName}`, 'info');
        // In a real application, you would redirect to invoice detail page
        // window.location.href = `/invoice/${invoice.id}`;
    }
    
    function initializeInvoices() {
        // Add event listeners to existing invoice cards
        document.querySelectorAll('.invoice-card .delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const card = this.closest('.invoice-card');
                deleteInvoice(card);
            });
        });
        
        document.querySelectorAll('.invoice-card .view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.invoice-card');
                const clientName = card.querySelector('.invoice-title').textContent;
                const invoiceNumber = card.querySelector('.invoice-subtitle').textContent;
                viewInvoice({ clientName, invoiceNumber });
            });
        });
    }
    
    function updateInvoiceCount() {
        const visibleCards = document.querySelectorAll('.invoice-card:not([style*="display: none"])').length;
        const totalCards = document.querySelectorAll('.invoice-card').length;
        
        if (invoiceCount) {
            invoiceCount.textContent = `${visibleCards} invoice${visibleCards !== 1 ? 's' : ''}`;
        }
    }
    
    function showToast(message, type = 'success') {
        if (!toast || !toastMessage) return;
        
        // Set message
        toastMessage.textContent = message;
        
        // Remove existing classes
        toast.className = 'toast';
        
        // Add type-specific styling
        if (type === 'error') {
            toast.style.backgroundColor = '#dc2626';
        } else if (type === 'warning') {
            toast.style.backgroundColor = '#f97316';
        } else if (type === 'info') {
            toast.style.backgroundColor = '#3b82f6';
        } else {
            toast.style.backgroundColor = '#111827';
        }
        
        // Show toast
        toast.classList.remove('hidden');
        toast.classList.add('visible');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('visible');
            toast.classList.add('hidden');
        }, 3000);
    }
    
    function generateInvoiceNumber() {
        const count = document.querySelectorAll('.invoice-card').length + 1;
        return `INV-${count.toString().padStart(3, '0')}`;
    }
    
    function getInitials(name) {
        if (!name) return '??';
        return name.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || '??';
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'Not set';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (e) {
            return 'Invalid date';
        }
    }
    
    // Additional functionality: Sort invoices
    function sortInvoices(sortBy = 'date', order = 'desc') {
        const container = invoiceGrid;
        const cards = Array.from(container.querySelectorAll('.invoice-card'));
        
        cards.sort((a, b) => {
            let aValue, bValue;
            
            switch(sortBy) {
                case 'amount':
                    aValue = parseFloat(a.dataset.amount) || 0;
                    bValue = parseFloat(b.dataset.amount) || 0;
                    break;
                case 'client':
                    aValue = a.querySelector('.invoice-title')?.textContent.toLowerCase() || '';
                    bValue = b.querySelector('.invoice-title')?.textContent.toLowerCase() || '';
                    break;
                case 'status':
                    aValue = a.dataset.status || '';
                    bValue = b.dataset.status || '';
                    break;
                default: // date
                    const aDate = a.querySelector('.invoice-meta div:nth-child(2) strong')?.textContent;
                    const bDate = b.querySelector('.invoice-meta div:nth-child(2) strong')?.textContent;
                    aValue = new Date(aDate) || new Date(0);
                    bValue = new Date(bDate) || new Date(0);
            }
            
            if (order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        // Reorder cards
        cards.forEach(card => container.appendChild(card));
    }
    
    // Export functions for debugging
    window.invoiceManager = {
        createInvoice,
        deleteInvoice,
        filterInvoices,
        sortInvoices,
        showToast,
        updateInvoiceCount
    };
});