from core.db_singleton import DatabaseConnection
from models.pharmacy import Pharmacy
class PharmacyRepository:
    def get_medicine_by_ID(self, Medicine_ID):
        db = None
        cursor = None
        try:
            db = DatabaseConnection().get_connection()
            cursor = db.cursor()
            cursor.execute("SELECT * FROM pharmacy WHERE Medicine_ID = ?", (Medicine_ID,))
            row = cursor.fetchone()
            if row:
                columns = [col[0] for col in cursor.description]
                row_dict = dict(zip(columns, row))
                return Pharmacy.from_dict(row_dict)
            return None
        except Exception as e:
            print(f"Database error in get_medicine_by_ID: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()
    
    def create_medicine(self, medicine: Pharmacy):
        db = None
        cursor = None
        try:
            db = DatabaseConnection().get_connection()
            cursor = db.cursor()
            cursor.execute(
                "INSERT INTO pharmacy (Medicine_Name, Quantity, price, Expiry_Date, Supplier) VALUES (?, ?, ?, ?, ?)",
                (medicine.MedicineName, medicine.Quantity, medicine.price, medicine.ExpiryDate, medicine.supplier)
            )
            db.commit()
        except Exception as e:
            print(f"Database error in create_medicine: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()
    def delete_medicine(self, Medicine_ID):
        db = None
        cursor = None
        try:
            db = DatabaseConnection().get_connection()
            cursor = db.cursor()
            cursor.execute("DELETE FROM pharmacy WHERE Medicine_ID = ?", (Medicine_ID,))
            db.commit()
        except Exception as e:
            print(f"Database error in delete_medicine: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()
    def get_all_medicines(self):
        db = None
        cursor = None
        try:
            db = DatabaseConnection().get_connection()
            cursor = db.cursor()
            cursor.execute("SELECT * FROM pharmacy")
            rows = cursor.fetchall()
            medicines = []
            if rows:
                columns = [col[0] for col in cursor.description]
                for row in rows:
                    row_dict = dict(zip(columns, row))
                    medicines.append(Pharmacy.from_dict(row_dict))
            return medicines
        except Exception as e:
            print(f"Database error in get_all_medicines: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()
    def update_medicine_quantity(self, Medicine_ID, new_quantity):
        db = None
        cursor = None
        try:
            db = DatabaseConnection().get_connection()
            cursor = db.cursor()
            cursor.execute(
                "UPDATE pharmacy SET Quantity = ? WHERE Medicine_ID = ?",
                (new_quantity, Medicine_ID)
            )
            db.commit()
        except Exception as e:
            print(f"Database error in update_medicine_quantity: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()