class Invoice:
    def __init__(self, id, invoice_number, client_name, amount, status="Pending", due_date=None, issued_date=None):
        self.id = id
        self.invoice_number = invoice_number
        self.client_name = client_name
        self.amount = amount
        self.status = status
        self.due_date = due_date
        self.issued_date = issued_date

    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'client_name': self.client_name,
            'amount': self.amount,
            'status': self.status,
            'due_date': self.due_date,
            'issued_date': self.issued_date
        }