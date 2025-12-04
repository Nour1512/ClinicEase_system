class Doctor:
    def __init__(self, doctor_id, full_name, email, password, specialty, phone, availability, rating):
        self.doctor_id = doctor_id
        self.full_name = full_name
        self.email = email
        self.password = password
        self.specialty = specialty
        self.phone = phone
        self.availability = availability
        self.rating = rating

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
            rating=data.get('rating')  # May be NULL in DB
        )