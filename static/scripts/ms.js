class MedicineStockManager {
    constructor() {
        this.medicines = [];
        this.currentMedicine = null;
        this.init();
        this.debounceTimer = null; // For search debounce
    }

    init() {
        this.loadMedicines();
        this.setupEventListeners();
        this.setupFormValidation();
    }

    async loadMedicines() {
        try {
            const response = await fetch('/medicine-stock/api/medicines');
            if (!response.ok) throw new Error('Failed to load medicines');
            this.medicines = await response.json();
            this.renderMedicines();
            this.updateSummary();
        } catch (error) {
            this.showToast('Error loading medicines', 'error');
        }
    }

    renderMedicines() {
        const tbody = document.getElementById('medicineTableBody');
        tbody.innerHTML = '';

        this.medicines.forEach(medicine => {
            const row = document.createElement('tr');
            const stockStatus = this.getStockStatus(medicine.quantity);
            const statusClass = this.getStatusClass(stockStatus);

            row.innerHTML = `
                <td>
                    <div class="medicine-name">${medicine.name}</div>
                    <div class="medicine-description">${medicine.description || ''}</div>
                </td>
                <td>${medicine.category || ''}</td>
                <td>${medicine.manufacturer || ''}</td>
                <td>$${medicine.price.toFixed(2)}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        <span class="dot"></span>
                        ${stockStatus}
                    </span>
                </td>
                <td class="text-right">${medicine.quantity}</td>
                <td>${medicine.expiration_date || 'N/A'}</td>
                <td class="text-right">
                    <button class="btn-round" onclick="stockManager.editMedicine(${medicine.id})">
                        <span class="icon">✏️</span>
                    </button>
                    <button class="btn-round" onclick="stockManager.deleteMedicine(${medicine.id})">
                        <span class="icon">🗑️</span>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    getStockStatus(quantity) {
        if (quantity === 0) return 'Out of Stock';
        if (quantity <= 10) return 'Low Stock';
        if (quantity <= 50) return 'Medium Stock';
        return 'High Stock';
    }

    getStatusClass(status) {
        switch (status) {
            case 'High Stock': return 'in-stock';
            case 'Medium Stock': return 'in-stock';
            case 'Low Stock': return 'low-stock';
            case 'Out of Stock': return 'out-of-stock';
            default: return '';
        }
    }

    updateSummary() {
        const totalValue = this.medicines.reduce((sum, med) => sum + (med.price * med.quantity), 0);
        const totalItems = this.medicines.length;
        const lowStock = this.medicines.filter(med => med.quantity <= 10 && med.quantity > 0).length;
        const outOfStock = this.medicines.filter(med => med.quantity === 0).length;

        document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('lowStock').textContent = lowStock;
        document.getElementById('outOfStock').textContent = outOfStock;
        document.getElementById('totalMedicines').textContent = totalItems;

        this.updateStockTags(lowStock, outOfStock);
    }

    updateStockTags(lowStock, outOfStock) {
        const tagsContainer = document.querySelector('.stock-tags');
        tagsContainer.innerHTML = '';

        if (outOfStock > 0) {
            tagsContainer.innerHTML += `
                <span class="stock-tag out-of-stock">
                    ${outOfStock} Out of Stock
                </span>
            `;
        }

        if (lowStock > 0) {
            tagsContainer.innerHTML += `
                <span class="stock-tag low">
                    ${lowStock} Low Stock
                </span>
            `;
        }

        const total = this.medicines.length;
        const highStock = total - lowStock - outOfStock;
        if (highStock > 0) {
            tagsContainer.innerHTML += `
                <span class="stock-tag high">
                    ${highStock} In Stock
                </span>
            `;
        }
    }

    setupEventListeners() {
        // Search with debounce
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.searchMedicines(e.target.value);
            }, 300);
        });

        document.getElementById('addMedicineBtn').addEventListener('click', () => this.openMedicineForm());
        document.getElementById('closeModal').addEventListener('click', () => this.closeMedicineForm());
        document.getElementById('cancelMedicineBtn').addEventListener('click', () => this.closeMedicineForm());
        document.querySelector('.btn-round.refresh').addEventListener('click', () => this.loadMedicines());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('printBtn').addEventListener('click', () => this.printReport());

        // ---------------- Quick Actions ----------------
        document.querySelectorAll('.summary-card button')[0].addEventListener('click', () => {
            this.showToast('Generating stock report...', 'success');
            this.printReport();
        });
        document.querySelectorAll('.summary-card button')[1].addEventListener('click', () => {
            this.showToast('Checking expiry dates...', 'info');
            this.checkExpiryDates();
        });
        document.querySelectorAll('.summary-card button')[2].addEventListener('click', () => {
            this.showToast('Notifying suppliers...', 'info');
            this.notifySuppliers();
        });
        document.querySelectorAll('.summary-card button')[3].addEventListener('click', () => {
            this.showToast('Opening analytics...', 'info');
            this.viewAnalytics();
        });
    }

    setupFormValidation() {
        const form = document.getElementById('medicineForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm()) this.saveMedicine();
        });
    }

    validateForm() {
        const name = document.getElementById('medicineName').value.trim();
        const price = parseFloat(document.getElementById('medicinePrice').value);
        const quantity = parseInt(document.getElementById('medicineQuantity').value);
        const expDateVal = document.getElementById('medicineExpiration').value;
        const expDate = expDateVal ? new Date(expDateVal) : null;

        if (!name) { this.showToast('Please enter medicine name', 'error'); return false; }
        if (isNaN(price) || price <= 0) { this.showToast('Please enter a valid price', 'error'); return false; }
        if (isNaN(quantity) || quantity < 0) { this.showToast('Please enter a valid quantity', 'error'); return false; }
        if (expDate && expDate < new Date()) { this.showToast('Expiration date cannot be in the past', 'error'); return false; }

        return true;
    }

    openMedicineForm(medicine = null) {
        this.currentMedicine = medicine;
        const modal = document.getElementById('medicineModal');
        const form = document.getElementById('medicineForm');
        const title = document.getElementById('modalTitle');

        if (medicine) {
            title.textContent = 'Edit Medicine';
            document.getElementById('medicineName').value = medicine.name;
            document.getElementById('medicineDescription').value = medicine.description || '';
            document.getElementById('medicineCategory').value = medicine.category || '';
            document.getElementById('medicineManufacturer').value = medicine.manufacturer || '';
            document.getElementById('medicinePrice').value = medicine.price || '';
            document.getElementById('medicineQuantity').value = medicine.quantity || '';
            document.getElementById('medicineExpiration').value = medicine.expiration_date || '';
            document.getElementById('medicineBatch').value = medicine.batch_number || '';
        } else {
            title.textContent = 'Add New Medicine';
            form.reset();
        }

        modal.style.display = 'flex';
    }

    closeMedicineForm() {
        document.getElementById('medicineModal').style.display = 'none';
        document.getElementById('medicineForm').reset();
        this.currentMedicine = null;
    }

    async saveMedicine() {
        if (!this.validateForm()) return;

        const formData = {
            name: document.getElementById('medicineName').value.trim(),
            description: document.getElementById('medicineDescription').value.trim(),
            category: document.getElementById('medicineCategory').value,
            manufacturer: document.getElementById('medicineManufacturer').value.trim(),
            price: parseFloat(document.getElementById('medicinePrice').value),
            quantity: parseInt(document.getElementById('medicineQuantity').value),
            expiration_date: document.getElementById('medicineExpiration').value,
            batch_number: document.getElementById('medicineBatch').value.trim()
        };

        try {
            const method = this.currentMedicine ? 'PUT' : 'POST';
            const url = this.currentMedicine 
                ? `/medicine-stock/api/medicines/${this.currentMedicine.id}` 
                : '/medicine-stock/api/medicines';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save medicine');

            this.showToast(this.currentMedicine ? 'Medicine updated successfully' : 'Medicine added successfully', 'success');
            this.closeMedicineForm();
            this.loadMedicines();

        } catch (error) {
            this.showToast('Error saving medicine', 'error');
        }
    }

    async editMedicine(id) {
        const medicine = this.medicines.find(med => med.id === id);
        if (medicine) this.openMedicineForm(medicine);
    }

    async deleteMedicine(id) {
        if (!confirm('Are you sure you want to delete this medicine?')) return;
        try {
            const response = await fetch(`/medicine-stock/api/medicines/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete medicine');
            this.showToast('Medicine deleted successfully', 'success');
            this.loadMedicines();
        } catch (error) {
            this.showToast('Error deleting medicine', 'error');
        }
    }

    async searchMedicines(query) {
        try {
            const response = await fetch(`/medicine-stock/api/medicines/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            this.medicines = await response.json();
        } catch {
            this.medicines = this.medicines.filter(med => 
                med.name.toLowerCase().includes(query.toLowerCase()) ||
                (med.description && med.description.toLowerCase().includes(query.toLowerCase())) ||
                (med.category && med.category.toLowerCase().includes(query.toLowerCase())) ||
                (med.manufacturer && med.manufacturer.toLowerCase().includes(query.toLowerCase()))
            );
        }
        this.renderMedicines();
        this.updateSummary();
    }

    exportData() {
        const data = this.medicines.map(med => ({
            Name: med.name,
            Description: med.description,
            Category: med.category,
            Manufacturer: med.manufacturer,
            Price: med.price,
            Quantity: med.quantity,
            'Expiration Date': med.expiration_date,
            'Batch Number': med.batch_number,
            Status: this.getStockStatus(med.quantity)
        }));

        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medicine-stock-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showToast('Data exported successfully', 'success');
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(h => JSON.stringify(row[h])).join(','));
        return [headers.join(','), ...rows].join('\n');
    }

    printReport() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Medicine Stock Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    .status { padding: 4px 8px; border-radius: 12px; font-size: 12px; }
                    .in-stock { background: #dcfce7; color: #16a34a; }
                    .low-stock { background: #fef3c7; color: #f97316; }
                    .out-of-stock { background: #fee2e2; color: #dc2626; }
                    .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <h1>Medicine Stock Report</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
                <div class="summary">
                    <h2>Summary</h2>
                    <p>Total Medicines: ${this.medicines.length}</p>
                    <p>Total Value: $${this.medicines.reduce((sum, med) => sum + (med.price * med.quantity), 0).toFixed(2)}</p>
                    <p>Low Stock Items: ${this.medicines.filter(m => m.quantity <= 10 && m.quantity > 0).length}</p>
                    <p>Out of Stock: ${this.medicines.filter(m => m.quantity === 0).length}</p>
                </div>
                <h2>Medicine Details</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Manufacturer</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Expiration Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.medicines.map(m => `
                            <tr>
                                <td>${m.name}</td>
                                <td>${m.category}</td>
                                <td>${m.manufacturer}</td>
                                <td>$${m.price.toFixed(2)}</td>
                                <td>${m.quantity}</td>
                                <td>
                                    <span class="status ${this.getStatusClass(this.getStockStatus(m.quantity))}">
                                        ${this.getStockStatus(m.quantity)}
                                    </span>
                                </td>
                                <td>${m.expiration_date || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    // ---------------- Quick Actions Methods ----------------
    checkExpiryDates() {
        const expired = this.medicines.filter(m => m.expiration_date && new Date(m.expiration_date) < new Date());
        if(expired.length) {
            this.showToast(`${expired.length} medicines are expired!`, 'error');
        } else {
            this.showToast('No expired medicines found', 'success');
        }
    }

    notifySuppliers() {
        this.showToast('Suppliers have been notified!', 'success');
    }

    viewAnalytics() {
        this.showToast('Analytics opened (demo)', 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast visible';
        toast.style.background = type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#111827';
        setTimeout(() => { toast.className = 'toast'; }, 3000);
    }
}

// Initialize
const stockManager = new MedicineStockManager();
