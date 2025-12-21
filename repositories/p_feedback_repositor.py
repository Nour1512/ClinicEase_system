from core.db_singleton import DatabaseSingleton
from models.p_feedback import PatientFeedback
from datetime import datetime, timedelta

class PatientFeedbackRepository:
    def __init__(self, db_path='database/patient_feedback.db'):
        self.db = DatabaseSingleton(db_path)
    
    def save_feedback(self, feedback):
        """Save feedback to database"""
        try:
            # Validate feedback
            errors = feedback.validate()
            if errors:
                return False
            
            # Insert feedback into database
            query = '''
                INSERT INTO patient_feedback 
                (gender, birth_month, birth_day, birth_year, 
                 doctor_knowledge, doctor_kindness, nurse_patience, nurse_knowledge,
                 waiting_time, hygiene, improvement_suggestions, overall_rating, submission_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            '''
            
            params = (
                feedback.gender,
                feedback.birth_month,
                feedback.birth_day,
                feedback.birth_year,
                feedback.doctor_knowledge,
                feedback.doctor_kindness,
                feedback.nurse_patience,
                feedback.nurse_knowledge,
                feedback.waiting_time,
                feedback.hygiene,
                feedback.improvement_suggestions,
                feedback.overall_rating,
                feedback.submission_date
            )
            
            cursor = self.db.execute_query(query, params)
            feedback.id = cursor.lastrowid
            return True
            
        except Exception as e:
            print(f"Error saving feedback: {str(e)}")
            return False
    
    def get_feedback_by_id(self, feedback_id):
        """Get feedback by ID"""
        try:
            query = "SELECT * FROM patient_feedback WHERE id = ?"
            row = self.db.fetch_one(query, (feedback_id,))
            
            if row:
                return PatientFeedback(**dict(row))
            return None
        except Exception as e:
            print(f"Error getting feedback: {str(e)}")
            return None
    
    def get_all_feedback(self, limit=100):
        """Get all feedback"""
        try:
            query = "SELECT * FROM patient_feedback ORDER BY submission_date DESC LIMIT ?"
            rows = self.db.fetch_all(query, (limit,))
            
            feedback_list = []
            for row in rows:
                feedback = PatientFeedback(**dict(row))
                feedback_list.append(feedback.to_dict())
            
            return feedback_list
        except Exception as e:
            print(f"Error getting all feedback: {str(e)}")
            return []
    
    def get_feedback_stats(self):
        """Get feedback statistics"""
        try:
            stats = {}
            
            # Overall average rating
            query = "SELECT AVG(overall_rating) as avg_rating FROM patient_feedback"
            row = self.db.fetch_one(query)
            stats['average_rating'] = round(row['avg_rating'] or 0, 2)
            
            # Total feedback count
            query = "SELECT COUNT(*) as total FROM patient_feedback"
            row = self.db.fetch_one(query)
            stats['total_feedback'] = row['total']
            
            # Feedback by gender
            query = """
                SELECT gender, COUNT(*) as count 
                FROM patient_feedback 
                WHERE gender IS NOT NULL 
                GROUP BY gender
            """
            rows = self.db.fetch_all(query)
            stats['gender_distribution'] = {row['gender']: row['count'] for row in rows}
            
            # Average ratings by category
            categories = [
                'doctor_knowledge',
                'doctor_kindness', 
                'nurse_patience',
                'nurse_knowledge',
                'waiting_time',
                'hygiene'
            ]
            
            category_ratings = {}
            for category in categories:
                query = f"SELECT AVG({category}) as avg_rating FROM patient_feedback"
                row = self.db.fetch_one(query)
                category_ratings[category] = round(row['avg_rating'] or 0, 2)
            
            stats['category_ratings'] = category_ratings
            
            # Recent feedback (last 7 days)
            seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            query = """
                SELECT COUNT(*) as recent_count 
                FROM patient_feedback 
                WHERE DATE(submission_date) >= ?
            """
            row = self.db.fetch_one(query, (seven_days_ago,))
            stats['recent_feedback'] = row['recent_count']
            
            # Rating distribution
            query = """
                SELECT 
                    CASE 
                        WHEN overall_rating >= 4.5 THEN 'Excellent'
                        WHEN overall_rating >= 3.5 THEN 'Good'
                        WHEN overall_rating >= 2.5 THEN 'Average'
                        WHEN overall_rating >= 1.5 THEN 'Poor'
                        ELSE 'Very Poor'
                    END as rating_category,
                    COUNT(*) as count
                FROM patient_feedback
                GROUP BY rating_category
                ORDER BY rating_category
            """
            rows = self.db.fetch_all(query)
            stats['rating_distribution'] = {row['rating_category']: row['count'] for row in rows}
            
            return {
                'success': True,
                'stats': stats
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error getting stats: {str(e)}'
            }
    
    def delete_feedback(self, feedback_id):
        """Delete feedback by ID"""
        try:
            query = "DELETE FROM patient_feedback WHERE id = ?"
            self.db.execute_query(query, (feedback_id,))
            return True
        except Exception as e:
            print(f"Error deleting feedback: {str(e)}")
            return False