from core.db_singleton import DatabaseConnection
from models.p_feedback import PatientFeedback

class PatientFeedbackRepository:
    
    def save_feedback(self, feedback: PatientFeedback):
        db = DatabaseConnection().get_connection()
        cursor = None
        try:
            cursor = db.cursor()
            query = """
                INSERT INTO Patient_Feedback
                (patient_name, gender, doctor_knowledge, doctor_kindness,
                 nurse_patience, nurse_knowledge, waiting_time, hygiene,
                 improvement_suggestions, overall_rating, submission_date, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(query, (
                feedback.patient_name, feedback.gender,
                feedback.doctor_knowledge, feedback.doctor_kindness,
                feedback.nurse_patience, feedback.nurse_knowledge,
                feedback.waiting_time, feedback.hygiene,
                feedback.improvement_suggestions, feedback.overall_rating,
                feedback.submission_date, feedback.status
            ))
            db.commit()
        finally:
            if cursor: cursor.close()
            db.close()

    def save_feedback_raw(self, **kwargs):
        """حفظ التقييم مباشرة من الـ Blueprint"""
        db = DatabaseConnection().get_connection()
        cursor = None
        try:
            cursor = db.cursor()
            cursor.execute("""
                INSERT INTO Patient_Feedback
                (patient_name, gender, doctor_knowledge, doctor_kindness,
                 nurse_patience, nurse_knowledge, waiting_time, hygiene,
                 improvement_suggestions, overall_rating, submission_date, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                kwargs.get('patient_name'), kwargs.get('gender'),
                kwargs.get('doctor_knowledge'), kwargs.get('doctor_kindness'),
                kwargs.get('nurse_patience'), kwargs.get('nurse_knowledge'),
                kwargs.get('waiting_time'), kwargs.get('hygiene'),
                kwargs.get('improvement_suggestions'), kwargs.get('overall_rating'),
                kwargs.get('submission_date'), kwargs.get('status')
            ))
            db.commit()
        finally:
            if cursor: cursor.close()
            db.close()

    def get_all_feedback(self):
        db = DatabaseConnection().get_connection()
        cursor = None
        try:
            cursor = db.cursor()
            cursor.execute("SELECT * FROM Patient_Feedback ORDER BY submission_date DESC")
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            return [PatientFeedback(**dict(zip(columns, row))) for row in rows]
        finally:
            if cursor: cursor.close()
            db.close()

    def get_feedback_stats(self):
        db = DatabaseConnection().get_connection()
        cursor = None
        try:
            cursor = db.cursor()
            cursor.execute("""
                SELECT 
                    AVG(CAST(doctor_knowledge AS FLOAT)), AVG(CAST(doctor_kindness AS FLOAT)),
                    AVG(CAST(nurse_patience AS FLOAT)), AVG(CAST(nurse_knowledge AS FLOAT)),
                    AVG(CAST(waiting_time AS FLOAT)), AVG(CAST(hygiene AS FLOAT))
                FROM Patient_Feedback
            """)
            row = cursor.fetchone()
            keys = ['doctor_knowledge', 'doctor_kindness', 'nurse_patience', 
                    'nurse_knowledge', 'waiting_time', 'hygiene']
            return {k: round(v, 2) if v is not None else 0 for k, v in zip(keys, row)}
        finally:
            if cursor: cursor.close()
            db.close()