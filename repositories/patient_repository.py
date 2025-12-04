# from core.db_singleton import DatabaseConnection
# from models.patient import Patient


# class PatientRepository:
#     def __init__(self):
#         self.db = DatabaseConnection().get_connection()


#     def get_patient_by_email(self , email):
#         cursor = self.db.cursor()
#         cursor.execute("SELECT * FROM Patients WHERE email = ?", (email,))
#         row = cursor.fetchone()
#         cursor.close()
#         if row:
#             return Patient(**row)
#         return None

#     def create_patient(self , name, email, password="oauth_user"):
#         cursor = self.db.cursor()
#         cursor.execute("INSERT INTO Patients (full_name, email, password) VALUES (?, ?, ?)",
#                 (name, email, password))
#         self.db.commit()
#         cursor.execute("SELECT * FROM Patients WHERE email = ?", (email,))
#         row = cursor.fetchone()
#         cursor.close()
#         return Patient(**row)









# patient_repository.py
from core.db_singleton import DatabaseConnection
from models.patient import Patient

class PatientRepository:

    def get_patient_by_email(self, email):
        # 🔑 Get a NEW connection for this operation
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("SELECT * FROM Patients WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row:
                # Convert pyodbc.Row to dict so Patient(**row) works
                columns = [col[0] for col in cursor.description]
                row_dict = dict(zip(columns, row))
                return Patient.from_dict(row_dict)
            return None
        finally:
            cursor.close()
            db.close()  # Return connection resources

    def create_patient(self, name, email, password="oauth_user"):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute(
                "INSERT INTO Patients (full_name, email, password) VALUES (?, ?, ?)",
                (name, email, password)
            )
            db.commit()
            cursor.execute("SELECT * FROM Patients WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row:
                columns = [col[0] for col in cursor.description]
                row_dict = dict(zip(columns, row))
                return Patient.from_dict(row_dict)
            else:
                raise Exception("Failed to retrieve created patient")
        finally:
            cursor.close()
            db.close()