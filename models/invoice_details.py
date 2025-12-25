class Invoice:
    def __init__(self, id, client_name, amount, status, issued_date, address=None):
        self.id = id
        self.invoice_number = f"INV-{id:04d}"
        self.client_name = client_name
        self.amount = float(amount) if amount else 0.0
        self.status = status if status else "Pending"
        self.issued_date = issued_date
        self.address = address if address else "No address on file"