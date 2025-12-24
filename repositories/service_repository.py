from core.db_singleton import DatabaseConnection
from models.service import Service

class ServiceRepository:
    def __init__(self):
        self.db = DatabaseConnection()

    def get_all_services(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT Service_ID, Service_Name, Department, Price, Status, Created_At
            FROM Services
            ORDER BY Created_At DESC
        """)
        rows = cursor.fetchall()
        conn.close()
        return [Service(*row) for row in rows]

    def get_total_services(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Services")
        total = cursor.fetchone()[0]
        conn.close()
        return total

    def add_service(self, data):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Services (Service_Name, Department, Price, Status)
            VALUES (?, ?, ?, ?)
        """, (
            data['service_name'],
            data['department'],
            data['price'],
            data['status']
        ))
        conn.commit()
        conn.close()

    def update_service(self, data):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE Services
            SET Service_Name=?, Department=?, Price=?, Status=?
            WHERE Service_ID=?
        """, (
            data['service_name'],
            data['department'],
            data['price'],
            data['status'],
            data['service_id']
        ))
        conn.commit()
        conn.close()

    def delete_service(self, service_id):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Services WHERE Service_ID=?", (service_id,))
        if cursor.rowcount == 0:
            conn.close()
            raise Exception("Service not found")
        conn.commit()


    def search_services(self, keyword):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT Service_ID, Service_Name, Department, Price, Status, Created_At
            FROM Services
            WHERE Service_Name LIKE ? OR Department LIKE ?
        """, (f"%{keyword}%", f"%{keyword}%"))
        rows = cursor.fetchall()
        conn.close()
        return [Service(*row) for row in rows]
