from core.db_singleton import DatabaseConnection
from models.admin import Admin

class AdminRepository:

    def get_admin_by_email(self, email):
        # 🔑 Get a NEW connection for this operation
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("SELECT * FROM Admins WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row:
                # Convert pyodbc.Row to dict so Patient(**row) works
                columns = [col[0] for col in cursor.description]
                row_dict = dict(zip(columns, row))
                return Admin.from_dict(row_dict)
            return None
        finally:
            cursor.close()
            db.close()  # Return connection resources