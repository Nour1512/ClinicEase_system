from datetime import datetime

class PatientFeedback:
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.patient_name = kwargs.get('patient_name')
        self.gender = kwargs.get('gender')

        self.doctor_knowledge = kwargs.get('doctor_knowledge')
        self.doctor_kindness = kwargs.get('doctor_kindness')
        self.nurse_patience = kwargs.get('nurse_patience')
        self.nurse_knowledge = kwargs.get('nurse_knowledge')
        self.waiting_time = kwargs.get('waiting_time')
        self.hygiene = kwargs.get('hygiene')

        self.improvement_suggestions = kwargs.get('improvement_suggestions')
        self.overall_rating = kwargs.get('overall_rating')
        self.submission_date = kwargs.get('submission_date')
        self.status = kwargs.get('status', 'pending')

    def to_dict(self):
        return {
            'id': self.id,
            'patient_name': self.patient_name,
            'gender': self.gender,
            'doctor_knowledge': self.doctor_knowledge,
            'doctor_kindness': self.doctor_kindness,
            'nurse_patience': self.nurse_patience,
            'nurse_knowledge': self.nurse_knowledge,
            'waiting_time': self.waiting_time,
            'hygiene': self.hygiene,
            'improvement_suggestions': self.improvement_suggestions,
            'overall_rating': round(self.overall_rating, 2) if self.overall_rating else None,
            'submission_date': self.submission_date,
            'status': self.status
        }

    def validate(self):
        errors = []

        if not self.patient_name:
            errors.append("Patient name is required")

        if self.gender and self.gender.lower() not in ['male', 'female']:
            errors.append("Invalid gender")

        ratings = [
            self.doctor_knowledge,
            self.doctor_kindness,
            self.nurse_patience,
            self.nurse_knowledge,
            self.waiting_time,
            self.hygiene
        ]

        for r in ratings:
            if r is not None and (r < 1 or r > 5):
                errors.append("Ratings must be between 1 and 5")

        return errors
