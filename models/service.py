class Service:
    def __init__(self, id, name, department, price, status, created_at=None):
        self.id = id
        self.name = name
        self.department = department
        self.price = price
        self.status = status
        self.created_at = created_at
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "department": self.department,
            "price": float(self.price) if self.price else 0.0,
            "status": self.status,
            "created_at": str(self.created_at) if self.created_at else None
        }