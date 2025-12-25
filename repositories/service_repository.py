
from core.db_singleton import DatabaseConnection
from models.service import Service

class ServiceRepository:
    def get_all_services(self):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("SELECT Service_ID, Service_Name, Department, Price, Status, Created_At FROM Services")
            rows = cursor.fetchall()
            return [Service(row[0], row[1], row[2], row[3], row[4], row[5]) for row in rows]
        finally:
            cursor.close()
            db.close()

    def add_service(self, data):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("""
                INSERT INTO Services (Service_Name, Department, Price, Status, Created_At)
                VALUES (?, ?, ?, ?, GETDATE())
            """, (data['service_name'], data['department'], data['price'], data['status']))
            db.commit() # ✅ Required to save to DB
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()
            db.close()

    def update_service(self, data):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("""
                UPDATE Services 
                SET Service_Name = ?, Department = ?, Price = ?, Status = ?
                WHERE Service_ID = ?
            """, (data['service_name'], data['department'], data['price'], data['status'], data['service_id']))
            db.commit() # ✅ Required to save updates
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()
            db.close()

    def delete_service(self, service_id):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("DELETE FROM Services WHERE Service_ID = ?", (service_id,))
            db.commit()
            return True
        finally:
            cursor.close()
            db.close()