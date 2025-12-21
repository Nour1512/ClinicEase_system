from models.p_feedback import PatientFeedback
from repositories.p_feedback_repositor import PatientFeedbackRepository
from datetime import datetime

class PatientFeedbackController:
    def __init__(self):
        self.repository = PatientFeedbackRepository()
    
    def save_feedback(self, feedback_data):
        """Save patient feedback to database"""
        try:
            # Create PatientFeedback object
            feedback = PatientFeedback(
                gender=feedback_data.get('gender'),
                birth_month=feedback_data.get('birth_month'),
                birth_day=feedback_data.get('birth_day'),
                birth_year=feedback_data.get('birth_year'),
                doctor_knowledge=feedback_data.get('doctor_knowledge'),
                doctor_kindness=feedback_data.get('doctor_kindness'),
                nurse_patience=feedback_data.get('nurse_patience'),
                nurse_knowledge=feedback_data.get('nurse_knowledge'),
                waiting_time=feedback_data.get('waiting_time'),
                hygiene=feedback_data.get('hygiene'),
                improvement_suggestions=feedback_data.get('improvement_suggestions'),
                submission_date=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            )
            
            # Calculate overall rating
            ratings = [
                feedback.doctor_knowledge,
                feedback.doctor_kindness,
                feedback.nurse_patience,
                feedback.nurse_knowledge,
                feedback.waiting_time,
                feedback.hygiene
            ]
            valid_ratings = [r for r in ratings if r is not None]
            feedback.overall_rating = sum(valid_ratings) / len(valid_ratings) if valid_ratings else 0
            
            # Save to database
            success = self.repository.save_feedback(feedback)
            
            if success:
                return {
                    'success': True,
                    'message': 'Feedback saved successfully',
                    'feedback_id': feedback.id
                }
            else:
                return {
                    'success': False,
                    'message': 'Failed to save feedback'
                }
                
        except Exception as e:
            return {
                'success': False,
                'message': f'Error saving feedback: {str(e)}'
            }
    
    def get_feedback_stats(self):
        """Get feedback statistics"""
        try:
            return self.repository.get_feedback_stats()
        except Exception as e:
            return {
                'success': False,
                'message': f'Error getting stats: {str(e)}'
            }
    
    def get_all_feedback(self):
        """Get all feedback"""
        try:
            return self.repository.get_all_feedback()
        except Exception as e:
            return {
                'success': False,
                'message': f'Error getting feedback: {str(e)}'
            }
    
    def get_feedback_by_id(self, feedback_id):
        """Get feedback by ID"""
        try:
            return self.repository.get_feedback_by_id(feedback_id)
        except Exception as e:
            return {
                'success': False,
                'message': f'Error getting feedback: {str(e)}'
            }