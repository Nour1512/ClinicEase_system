from core.db_singleton import DatabaseConnection

class SettingsRepository:
    def Change_Password(self, user_id, new_password):
        db = None
        cursor = None
        try:
            db = DatabaseConnection().get_connection()
            cursor = db.cursor()
            cursor.execute(
                "UPDATE Patients SET password = ? WHERE patient_id = ?",
                (new_password, user_id)
            )
            db.commit()
        except Exception as e:
            print(f"Database error in Change_Password: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()
    def change_email(self, user_id, new_email):
        db = None
        cursor = None
        try:
            db = DatabaseConnection().get_connection()
            cursor = db.cursor()
            cursor.execute(
                "UPDATE Patients SET email = ? patient_id = ?",
                (new_email, user_id)
            )
            db.commit()
        except Exception as e:
            print(f"Database error in change_email: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()
    def change_name(self, user_id, new_name):
        db = None
        cursor = None
        try:
            db = DatabaseConnection().get_connection()
            cursor = db.cursor()
            cursor.execute(
                "UPDATE Patients SET full_name = ? WHERE patient_id = ?",
                (new_name, user_id)
            )
            db.commit()
        except Exception as e:
            print(f"Database error in change_name: {e}")

    def change_email(self, user_id, new_email):
        db = None
        cursor = None
        try:
            db = DatabaseConnection().get_connection()
            cursor = db.cursor()
            cursor.execute(
                "UPDATE Patients SET email = ? WHERE patient_id = ?",
                (new_email, user_id)
            )
            db.commit()
        except Exception as e:
            print(f"Database error in change_email: {e}")
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()

    def get_by_id(self, user_id):
        db = None
        cursor = None
        try:
            db = DatabaseConnection().get_connection()
            cursor = db.cursor()
            cursor.execute(
                "SELECT patient_id, full_name, email FROM Patients WHERE patient_id = ?",
                (user_id,)
            )
            row = cursor.fetchone()
            if row:
                return {
                    'patient_id': row[0],
                    'full_name': row[1],
                    'email': row[2]
                }
            return None
        except Exception as e:
            print(f"Database error in get_by_id: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()
