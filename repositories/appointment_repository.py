from core.db_singleton import DatabaseConnection
from models.appointment import Appointment


class AppointmentRepository:

    # ----------------------------------------------------
    # GET appointments (optional doctor filter)
    # ----------------------------------------------------
    def get_appointments(self, doctor_id=None):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()

            if doctor_id:
                cursor.execute("""
                    SELECT
                        a.Appointment_ID,
                        a.patient_id,
                        p.full_name AS patient_name,
                        a.doctor_id,
                        d.full_name AS doctor_name,
                        a.Appointment_Date,
                        a.Status,
                        a.Payment_Status,
                        a.Notes
                    FROM Appointment a
                    JOIN Patients p ON a.patient_id = p.patient_id
                    JOIN doctors d ON a.doctor_id = d.doctor_id
                    WHERE a.doctor_id = ?
                    ORDER BY a.Appointment_Date
                """, (doctor_id,))
            else:
                cursor.execute("""
                    SELECT
                        a.Appointment_ID,
                        a.patient_id,
                        p.full_name AS patient_name,
                        a.doctor_id,
                        d.full_name AS doctor_name,
                        a.Appointment_Date,
                        a.Status,
                        a.Payment_Status,
                        a.Notes
                    FROM Appointment a
                    JOIN Patients p ON a.patient_id = p.patient_id
                    JOIN doctors d ON a.doctor_id = d.doctor_id
                    ORDER BY a.Appointment_Date
                """)

            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]

            return [
                Appointment.from_dict(dict(zip(columns, row)))
                for row in rows
            ]

        finally:
            cursor.close()
            db.close()

    # ----------------------------------------------------
    # CREATE appointment
    # ----------------------------------------------------
    def create_appointment(self, patient_id, doctor_id, appointment_date, notes=None):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()

            cursor.execute("""
                INSERT INTO Appointment
                (patient_id, doctor_id, Appointment_Date, Status, Payment_Status, Notes)
                OUTPUT INSERTED.Appointment_ID
                VALUES (?, ?, ?, 'Pending', 'Unpaid', ?)
            """, (
                patient_id,
                doctor_id,
                appointment_date,
                notes
            ))

            appointment_id = cursor.fetchone()[0]
            db.commit()

            return appointment_id

        finally:
            cursor.close()
            db.close()

    # ----------------------------------------------------
    # UPDATE appointment status
    # ----------------------------------------------------
    def update_status(self, appointment_id, status):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()

            cursor.execute("""
                UPDATE Appointment
                SET Status = ?
                WHERE Appointment_ID = ?
            """, (status, appointment_id))

            db.commit()

        finally:
            cursor.close()
            db.close()

    # ----------------------------------------------------
    # DELETE appointment
    # ----------------------------------------------------
    def delete_appointment(self, appointment_id):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()

            cursor.execute("""
                DELETE FROM Appointment
                WHERE Appointment_ID = ?
            """, (appointment_id,))

            db.commit()

        finally:
            cursor.close()
            db.close()
    


    # Add this method to your AppointmentRepository class
    def get_patient_appointments(self, patient_id):
        """Get appointments for a specific patient"""
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("""
                SELECT
                    a.Appointment_ID,
                    a.patient_id,
                    p.full_name AS patient_name,
                    a.doctor_id,
                    d.full_name AS doctor_name,
                    a.Appointment_Date,
                    a.Status,
                    a.Payment_Status,
                    a.Notes
                FROM Appointment a
                JOIN Patients p ON a.patient_id = p.patient_id
                JOIN doctors d ON a.doctor_id = d.doctor_id
                WHERE a.patient_id = ?
                ORDER BY a.Appointment_Date
            """, (patient_id,))
            
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            
            return [
                Appointment.from_dict(dict(zip(columns, row)))
                for row in rows
            ]
        finally:
            cursor.close()
            db.close()

appointment_repository.py