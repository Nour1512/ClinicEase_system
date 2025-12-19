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
    

    def get_patient_by_id(self, patient_id):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("SELECT * FROM Patients WHERE patient_id = ?", (patient_id,))
            row = cursor.fetchone()
            if row:
                columns = [col[0] for col in cursor.description]
                row_dict = dict(zip(columns, row))
                # return Patient.from_dict(row_dict)
                return Patient(
                    patient_id=row_dict['patient_id'],
                    full_name=row_dict['full_name'],
                    email=row_dict['email'],
                    password=row_dict['password'],
                    medical_history=row_dict.get('medical_history'),
                    address=row_dict.get('address'),
                    dob=row_dict.get('dob'),
                    gender=row_dict.get('gender'),
                    emergency_contact=row_dict.get('emergency_contact'),  # ← This might be None
                )
            return None
        finally:
            cursor.close()
            db.close()
    


    def update_patient_profile(self, patient_id, emergency_contact, gender, dob, address, medical_history):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("""
                UPDATE Patients
                SET emergency_contact = ?, 
                    gender = ?, 
                    dob = ?, 
                    address = ?, 
                    medical_history = ?
                WHERE patient_id = ?
            """, (emergency_contact, gender, dob, address, medical_history, patient_id))
            db.commit()
        finally:
            cursor.close()
            db.close()

    

    def delete_patient(self, patient_id):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute(
                "DELETE FROM Patients WHERE patient_id = ?",
                (patient_id,)
            )
            db.commit()
        finally:
            cursor.close()
            db.close()

    
    def get_all_patients(self):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("SELECT * FROM Patients")
            rows = cursor.fetchall()

            columns = [col[0] for col in cursor.description]
            return [
                Patient.from_dict(dict(zip(columns, row)))
                for row in rows
            ]
        finally:
            cursor.close()
            db.close()
    

    def get_patients_by_doctor(self, doctor_id):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("""
                SELECT DISTINCT p.*
                FROM Patients p
                JOIN Appointment a ON a.patient_id = p.patient_id
                WHERE a.doctor_id = ?
            """, (doctor_id,))

            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]

            return [
                Patient.from_dict(dict(zip(columns, row)))
                for row in rows
            ]
        finally:
            cursor.close()
            db.close()
    


    def update_patient_profile_dynamic(self, patient_id, update_data):
        """Update only the fields provided in update_data dict"""
        if not update_data:
            return
        
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            set_clause = ", ".join([f"{field} = ?" for field in update_data.keys()])
            values = list(update_data.values()) + [patient_id]
            cursor.execute(f"UPDATE Patients SET {set_clause} WHERE patient_id = ?", values)
            db.commit()
        finally:
            cursor.close()
            db.close()
    


    def create_patient_from_admin(self, full_name, email, dob, gender, address, emergency_contact):
        """
        Creates a new patient record specifically for admin use in patient management page.
        """
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("""
                INSERT INTO Patients (full_name, email, dob, gender, address, emergency_contact, password)
                VALUES (?, ?, ?, ?, ?, ?, 'default_password')
            """, (full_name, email, dob, gender, address, emergency_contact, ))
            db.commit()
        finally:
            cursor.close()
            db.close()
    


