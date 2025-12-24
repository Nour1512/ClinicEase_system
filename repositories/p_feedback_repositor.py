from core.db_singleton import DatabaseConnection
from models.p_feedback import PatientFeedback

class PatientFeedbackRepository:
    def __init__(self):
        self.db = DatabaseConnection()

    def save_feedback(self, feedback: PatientFeedback):
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO patient_feedback
            (patient_name, gender,
             doctor_knowledge, doctor_kindness,
             nurse_patience, nurse_knowledge,
             waiting_time, hygiene,
             improvement_suggestions,
             overall_rating, submission_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        cursor.execute(query, (
            feedback.patient_name,
            feedback.gender,
            feedback.doctor_knowledge,
            feedback.doctor_kindness,
            feedback.nurse_patience,
            feedback.nurse_knowledge,
            feedback.waiting_time,
            feedback.hygiene,
            feedback.improvement_suggestions,
            feedback.overall_rating,
            feedback.submission_date,
            feedback.status
        ))

        conn.commit()
        conn.close()
        return True

    def get_all_feedback(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM patient_feedback ORDER BY submission_date DESC")
        columns = [col[0] for col in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]

        conn.close()
        return data

    def get_feedback_stats(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                AVG(CAST(doctor_knowledge AS FLOAT)),
                AVG(CAST(doctor_kindness AS FLOAT)),
                AVG(CAST(nurse_patience AS FLOAT)),
                AVG(CAST(nurse_knowledge AS FLOAT)),
                AVG(CAST(waiting_time AS FLOAT)),
                AVG(CAST(hygiene AS FLOAT))
            FROM patient_feedback
        """)

        row = cursor.fetchone()
        conn.close()

        keys = [
            'doctor_knowledge',
            'doctor_kindness',
            'nurse_patience',
            'nurse_knowledge',
            'waiting_time',
            'hygiene'
        ]

        return {k: round(v, 2) if v else None for k, v in zip(keys, row)}
