class Pharmacy:
    def __init__(self,Medicine_id,MedicineName,Quantity,Price,ExpiryDate,supplier):
        self.Medicine_id = Medicine_id
        self.MedicineName = MedicineName
        self.Quantity = Quantity
        self.Price = Price
        self.ExpiryDate = ExpiryDate
        self.supplier = supplier

    @classmethod
    def from_dict(cls, data):
        return cls(
            Medicine_id=data['Medicine_id'],
            MedicineName=data['MedicineName'],
            Quantity=data['Quantity'],
            Price=data['Price'],
            ExpiryDate=data['ExpiryDate'],
            supplier=data['supplier']
        )