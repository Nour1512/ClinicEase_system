from core.db_singleton import DatabaseConnection

class AppointmentRepository_book:
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
            
            if cursor.rowcount == 0:
                raise Exception("Insert failed: No rows affected")
                
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            print(f"Database insert error: {e}")
            raise e
        finally:
            cursor.close()
            db.close()