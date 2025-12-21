# repositories/doctor_repository.py
from core.db_singleton import DatabaseConnection
from models.doctor import Doctor

class DoctorRepository:
    def __init__(self):
        self.db = DatabaseConnection()

    def get_all_doctors(self):
        db = None
        cursor = None
        try:
            db = DatabaseConnection().get_connection()
            cursor = db.cursor()
            cursor.execute("SELECT * FROM doctors")
            rows = cursor.fetchall()
            doctors = []
            if rows:
                columns = [col[0] for col in cursor.description]
                for row in rows:
                    row_dict = dict(zip(columns, row))
                    doctors.append(Doctor.from_dict(row_dict))
            return doctors
        except Exception as e:
            print(f"Database error in get_all_doctors: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()


    def get_doctor_by_id(self, doctor_id):
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT doctor_id, full_name, email, password,
                   specialty, phone, availability,
                   rating, price, created_at
            FROM doctors
            WHERE doctor_id = ?
        """
        cursor.execute(query, (doctor_id,))
        row = cursor.fetchone()
        if row:
            columns = [col[0] for col in cursor.description]
            row_dict = dict(zip(columns, row))
            return Doctor.from_dict(row_dict)
        return None

    def get_doctor_by_email(self, email):
        db = None
        cursor = None
        try:
            db = DatabaseConnection().get_connection()
            cursor = db.cursor()
            cursor.execute("SELECT * FROM doctors WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row:
                columns = [col[0] for col in cursor.description]
                row_dict = dict(zip(columns, row))
                return Doctor.from_dict(row_dict)
            return None
        except Exception as e:
            print(f"Database error in get_doctor_by_email: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()

    def search_doctors(self, specialty=None, name=None):
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT doctor_id, full_name, email, password,
                   specialty, phone, availability,
                   rating, price, created_at
            FROM doctors
            WHERE 1=1
        """
        params = []

        if specialty:
            query += " AND specialty LIKE ?"
            params.append(f"%{specialty}%")

        if name:
            query += " AND full_name LIKE ?"
            params.append(f"%{name}%")

        query += " ORDER BY full_name"

        cursor.execute(query, params)
        rows = cursor.fetchall()
        doctors = []
        if rows:
            columns = [col[0] for col in cursor.description]
            for row in rows:
                row_dict = dict(zip(columns, row))
                doctors.append(Doctor.from_dict(row_dict))
        return doctors

    def get_total_doctors_count(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM doctors")
        return cursor.fetchone()[0]

    def get_available_today_count(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*)
            FROM doctors
            WHERE availability LIKE '%Mon%'
        """)
        return cursor.fetchone()[0]