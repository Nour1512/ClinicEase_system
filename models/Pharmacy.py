class Pharmacy:
    def __init__(self,Medicine_id,MedicineName,Quantity,price,ExpiryDate,supplier):
        self.Medicine_id = Medicine_id
        self.MedicineName = MedicineName
        self.Quantity = Quantity
        self.price = price
        self.ExpiryDate = ExpiryDate
        self.supplier = supplier

    @classmethod
    def from_dict(cls, data):
        medicine_id = data.get('Medicine_ID') 
        medicine_name = data.get('Medicine_Name') 
        quantity = data.get('Quantity') if data.get('Quantity') is not None else 0
        price = data.get('price') if data.get('price') is not None else 0.0
        expiry_date = data.get('Expiry_Date')  
        supplier_name = data.get('Supplier')
        
        return cls(
            Medicine_id=medicine_id,
            MedicineName=medicine_name,
            Quantity=quantity,
            price=price,
            ExpiryDate=expiry_date,
            supplier=supplier_name
        )