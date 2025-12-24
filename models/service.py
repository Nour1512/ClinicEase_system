class Service:
    def __init__(self, service_id, service_name, department, price, status, created_at=None):
        self.service_id = service_id
        self.service_name = service_name
        self.department = department
        self.price = price
        self.status = status
        self.created_at = created_at

    def to_dict(self):
        return {
            "service_id": self.service_id,
            "service_name": self.service_name,
            "department": self.department,
            "price": float(self.price),
            "status": self.status,
            "created_at": str(self.created_at) if self.created_at else None
        }
