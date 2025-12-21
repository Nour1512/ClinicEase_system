class Doctor:
    def __init__(self, doctor_id, full_name, email, password, specialty, phone, availability, rating, price=None):
        self.doctor_id = doctor_id
        self.full_name = full_name
        self.email = email
        self.password = password
        self.specialty = specialty
        self.phone = phone
        self.availability = availability
        self.rating = rating
        self.price = price

    @classmethod
    def from_dict(cls, data):
        """Create a Doctor instance from a dictionary (e.g., from database row)."""
        return cls(
            doctor_id=data['doctor_id'],
            full_name=data['full_name'],
            email=data['email'],
            password=data['password'],
            specialty=data['specialty'],
            phone=data['phone'],
            availability=data['availability'],
            rating=data.get('rating'),  # May be NULL in DB
            price=data.get('price')  # May be NULL in DB
        )
    
    def to_dict(self):
        """Convert Doctor instance to dictionary for API responses."""
        return {
            'doctor_id': str(self.doctor_id) if self.doctor_id else None,
            'full_name': str(self.full_name) if self.full_name else '',
            'specialty': str(self.specialty) if self.specialty else '',
            'phone': str(self.phone) if self.phone else '',
            'availability': str(self.availability) if self.availability else '',
            'rating': float(self.rating) if self.rating is not None else 0.0,
            'price': float(self.price) if self.price is not None else 0.0,
            'email': str(self.email) if self.email else ''
        }