from models.p_feedback import PatientFeedback
from repositories.p_feedback_repositor import PatientFeedbackRepository
from datetime import datetime

class PatientFeedbackController:
    def __init__(self, get_db_connection=None):
        self.repository = PatientFeedbackRepository()

    def save_feedback(self, data):
        try:
            feedback = PatientFeedback(
                patient_name=data.get('patient_name'),
                gender=data.get('gender'),
                doctor_knowledge=data.get('doctor_knowledge'),
                doctor_kindness=data.get('doctor_kindness'),
                nurse_patience=data.get('nurse_patience'),
                nurse_knowledge=data.get('nurse_knowledge'),
                waiting_time=data.get('waiting_time'),
                hygiene=data.get('hygiene'),
                improvement_suggestions=data.get('improvement_suggestions'),
                submission_date=datetime.now().strftime('%Y-%m-%d'),
                status='pending'
            )

            ratings = [
                feedback.doctor_knowledge,
                feedback.doctor_kindness,
                feedback.nurse_patience,
                feedback.nurse_knowledge,
                feedback.waiting_time,
                feedback.hygiene
            ]

            valid = [r for r in ratings if r is not None]
            feedback.overall_rating = sum(valid) / len(valid) if valid else None

            errors = feedback.validate()
            if errors:
                return {'success': False, 'message': errors[0]}

            self.repository.save_feedback(feedback)
            return {'success': True, 'message': 'Feedback saved successfully'}

        except Exception as e:
            return {'success': False, 'message': str(e)}

    def get_all_feedback(self):
        return self.repository.get_all_feedback()

    def get_feedback_stats(self):
        return self.repository.get_feedback_stats()
