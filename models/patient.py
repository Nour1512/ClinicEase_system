class Patient:
    def __init__(self, patient_id, full_name, email, medical_history, address, dob, gender, emergency_contact , password , last_appointment=None):
        self.patient_id = patient_id
        self.full_name = full_name
        self.email = email
        # self.medical_history = medical_history
        # self.address = address
        # self.dob = dob
        # self.gender = gender
        # self.emergency_contact = emergency_contact,
        self.password = password
        self.last_appointment = last_appointment

        self.medical_history = medical_history if medical_history is not None else None
        self.address = address if address is not None else None
        self.dob = dob if dob is not None else None
        self.gender = gender if gender is not None else None
        self.emergency_contact = emergency_contact if emergency_contact is not None else None
    @classmethod
    def from_dict(cls, data):
        # Only extract the fields we need
        return cls(
            patient_id=data['patient_id'],
            full_name=data['full_name'],
            email=data['email'],
            medical_history=data['medical_history'],
            address=data['address'],
            dob=data['dob'],
            gender=data['gender'],
            emergency_contact=data['emergency_contact'],
            password=data['password'],
            last_appointment=data.get('last_appointment'),
            # created_at=data.get("created_at")
        )