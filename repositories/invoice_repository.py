from models.invoice import Invoice
from datetime import datetime, timedelta

class InvoiceRepository:
    def __init__(self):
        self.invoices = [
            Invoice(1, "INV-001", "John Doe", 1500.00, "Paid", "2024-01-20", "2024-01-15"),
            Invoice(2, "INV-002", "Jane Smith", 2500.00, "Pending", "2024-02-10", "2024-02-01"),
            Invoice(3, "INV-003", "Acme Corp", 5000.00, "Overdue", "2024-01-31", "2024-01-15"),
            Invoice(4, "INV-004", "Tech Solutions", 3200.00, "Paid", "2024-02-05", "2024-01-25"),
            Invoice(5, "INV-005", "Global Inc", 1800.00, "Pending", "2024-02-15", "2024-02-01"),
            Invoice(6, "INV-006", "Healthcare Ltd", 4200.00, "Paid", "2024-01-28", "2024-01-20")
        ]

    def get_all_invoices(self):
        return [inv.to_dict() for inv in self.invoices]

    def add_invoice(self, invoice_data):
        new_id = max(inv.id for inv in self.invoices) + 1 if self.invoices else 1
        new_invoice = Invoice(
            new_id,
            invoice_data.get('invoice_number', f"INV-{new_id:03d}"),
            invoice_data['client_name'],
            invoice_data['amount'],
            invoice_data.get('status', 'Pending'),
            invoice_data.get('due_date'),
            invoice_data.get('issued_date', datetime.now().strftime('%Y-%m-%d'))
        )
        self.invoices.append(new_invoice)
        return new_invoice.to_dict()

    def delete_invoice(self, invoice_id):
        initial_count = len(self.invoices)
        self.invoices = [inv for inv in self.invoices if inv.id != invoice_id]
        return len(self.invoices) < initial_count