from datetime import datetime

class PatientFeedback:
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.gender = kwargs.get('gender')
        self.birth_month = kwargs.get('birth_month')
        self.birth_day = kwargs.get('birth_day')
        self.birth_year = kwargs.get('birth_year')
        self.doctor_knowledge = kwargs.get('doctor_knowledge')
        self.doctor_kindness = kwargs.get('doctor_kindness')
        self.nurse_patience = kwargs.get('nurse_patience')
        self.nurse_knowledge = kwargs.get('nurse_knowledge')
        self.waiting_time = kwargs.get('waiting_time')
        self.hygiene = kwargs.get('hygiene')
        self.improvement_suggestions = kwargs.get('improvement_suggestions')
        self.overall_rating = kwargs.get('overall_rating')
        self.submission_date = kwargs.get('submission_date')
        self.created_at = kwargs.get('created_at')
    
    def to_dict(self):
        """Convert feedback object to dictionary"""
        return {
            'id': self.id,
            'gender': self.gender,
            'birth_month': self.birth_month,
            'birth_day': self.birth_day,
            'birth_year': self.birth_year,
            'doctor_knowledge': self.doctor_knowledge,
            'doctor_kindness': self.doctor_kindness,
            'nurse_patience': self.nurse_patience,
            'nurse_knowledge': self.nurse_knowledge,
            'waiting_time': self.waiting_time,
            'hygiene': self.hygiene,
            'improvement_suggestions': self.improvement_suggestions,
            'overall_rating': round(self.overall_rating, 2) if self.overall_rating else None,
            'submission_date': self.submission_date,
            'created_at': self.created_at
        }
    
    def validate(self):
        """Validate feedback data"""
        errors = []
        
        # Validate gender
        if self.gender and self.gender not in ['male', 'female', 'other', 'prefer-not-to-say']:
            errors.append("Invalid gender selection")
        
        # Validate birth date
        if self.birth_month and (self.birth_month < 1 or self.birth_month > 12):
            errors.append("Invalid birth month")
        
        if self.birth_day and (self.birth_day < 1 or self.birth_day > 31):
            errors.append("Invalid birth day")
        
        current_year = datetime.now().year
        if self.birth_year and (self.birth_year < 1900 or self.birth_year > current_year):
            errors.append("Invalid birth year")
        
        # Validate ratings (1-5)
        ratings = [
            ('doctor_knowledge', self.doctor_knowledge),
            ('doctor_kindness', self.doctor_kindness),
            ('nurse_patience', self.nurse_patience),
            ('nurse_knowledge', self.nurse_knowledge),
            ('waiting_time', self.waiting_time),
            ('hygiene', self.hygiene)
        ]
        
        for field, rating in ratings:
            if rating is not None and (rating < 1 or rating > 5):
                errors.append(f"Invalid rating for {field}")
        
        return errors
    
    def calculate_age(self):
        """Calculate age from birth date"""
        if not all([self.birth_year, self.birth_month, self.birth_day]):
            return None
        
        today = datetime.now()
        birth_date = datetime(self.birth_year, self.birth_month, self.birth_day)
        
        age = today.year - birth_date.year
        
        # Adjust if birthday hasn't occurred yet this year
        if (today.month, today.day) < (birth_date.month, birth_date.day):
            age -= 1
        
        return age