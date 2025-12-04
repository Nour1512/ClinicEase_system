class Patient:
    def __init__(self, patient_id, full_name, email, password):
        self.patient_id = patient_id
        self.full_name = full_name
        self.email = email
        self.password = password

    @classmethod
    def from_dict(cls, data):
        # Only extract the fields we need
        return cls(
            patient_id=data['patient_id'],
            full_name=data['full_name'],
            email=data['email'],
            password=data['password']
        )