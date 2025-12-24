from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Medicine:
    id: Optional[int] = None
    name: str = ""
    description: str = ""
    category: str = ""
    manufacturer: str = ""
    price: float = 0.0
    quantity: int = 0
    expiration_date: str = ""
    batch_number: str = ""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "manufacturer": self.manufacturer,
            "price": self.price,
            "quantity": self.quantity,
            "expiration_date": self.expiration_date,
            "batch_number": self.batch_number
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            name=data.get("name", ""),
            description=data.get("description", ""),
            category=data.get("category", ""),
            manufacturer=data.get("manufacturer", ""),
            price=float(data.get("price", 0)),
            quantity=int(data.get("quantity", 0)),
            expiration_date=data.get("expiration_date", ""),
            batch_number=data.get("batch_number", "")
        )