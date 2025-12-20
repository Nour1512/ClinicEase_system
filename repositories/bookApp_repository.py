from core.db_singleton import DatabaseConnection
from models.bookApp import Appointment  # Adjust import based on your actual model location


class AppointmentRepository:

    def add_appointment(self, appointment):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("""
                INSERT INTO BookAppointments
                (name, phone, email, date, time, area, city, state, post_code)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                appointment.name,
                appointment.phone,
                appointment.email,
                appointment.date,
                appointment.time,
                appointment.area,
                appointment.city,
                appointment.state,
                appointment.post_code
            ))

            db.commit()
        finally:
            cursor.close()
            db.close()