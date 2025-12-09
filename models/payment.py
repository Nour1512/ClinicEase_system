from datetime import datetime

class Payment:
    def __init__(self, payment_id=None, appointment_id=None, amount=0.0, payment_method='', payment_date=None, status='Pending'):
        self.payment_id = payment_id
        self.appointment_id = appointment_id
        self.amount = amount
        self.payment_method = payment_method
        self.payment_date = payment_date if payment_date else datetime.now()
        self.status = status

    def to_dict(self):
        return {
            'payment_id': self.payment_id,
            'appointment_id': self.appointment_id,
            'amount': self.amount,
            'payment_method': self.payment_method,
            'payment_date': self.payment_date.isoformat() if hasattr(self.payment_date, 'isoformat') else str(self.payment_date),
            'status': self.status
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            payment_id=data.get('payment_id'),
            appointment_id=data.get('appointment_id'),
            amount=float(data.get('amount', 0)),
            payment_method=data.get('payment_method', ''),
            payment_date=data.get('payment_date'),
            status=data.get('status', 'Pending')
        )