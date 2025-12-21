class patient_details:
    def __init__(self, patient_id, blood_type, height_cm, weight_kg,
                 medical_record, current_medications, medical_notes,
                 emergency_contact_name, emergency_contact_phone):
        self.patient_id = patient_id
        self.blood_type = blood_type
        self.height_cm = height_cm
        self.weight_kg = weight_kg
        self.medical_record = medical_record
        self.current_medications = current_medications
        self.medical_notes = medical_notes
        self.emergency_contact_name = emergency_contact_name
        self.emergency_contact_phone = emergency_contact_phone
        
    @classmethod
    def from_dict(cls, data):
        return cls(
            patient_id=data['patient_id'],
            blood_type=data["blood_type"],
            height_cm=data["height_cm"],
            weight_kg=data["weight_kg"],
            medical_record=data["medical_record"],
            current_medications=data["current_medications"],
            medical_notes=data["medical_notes"],
            emergency_contact_name=data["emergency_contact_name"],
            emergency_contact_phone=data["emergency_contact_phone"]
        )