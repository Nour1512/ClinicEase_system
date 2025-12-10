from core.db_singleton import DatabaseConnection

class ServiceRepository:
    def __init__(self):
        self.db = DatabaseConnection()
    
    def get_all_services(self):
     
        query = """
            SELECT Service_ID, Service_Name, Department, Price, Status, Created_At
            FROM Services
            ORDER BY Created_At DESC
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query)
        
        services = []
        for row in cursor.fetchall():
            services.append({
                'service_id': row[0],
                'service_name': row[1],
                'department': row[2],
                'price': float(row[3]),
                'status': row[4],
                'created_at': row[5]
            })
        
        conn.close()
        return services
    
    def get_total_services(self):
      
        query = "SELECT COUNT(*) FROM Services"
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query)
        count = cursor.fetchone()[0]
        conn.close()
        return count
    
    def add_service(self, service_data):

        query = """
            INSERT INTO Services (Service_Name, Department, Price, Status)
            VALUES (?, ?, ?, ?)
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, (
            service_data['service_name'],
            service_data['department'],
            service_data['price'],
            service_data['status']
        ))
        conn.commit()
        conn.close()
    
