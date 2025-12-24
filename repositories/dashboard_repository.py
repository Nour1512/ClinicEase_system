# repositories/dashboard_repository.py
from core.db_singleton import DatabaseConnection
from models.dashboard import DashboardStats, RecentActivity, AppointmentSummary
from datetime import datetime, date
import pyodbc

class DashboardRepository:
    def __init__(self):
        self.db = DatabaseConnection()
    
    def get_dashboard_stats(self, user_role=None, user_id=None):
        """Get dashboard statistics based on user role"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        try:
            stats = DashboardStats()
            
            # Get total patients
            cursor.execute("SELECT COUNT(*) FROM Patients")
            stats.total_patients = cursor.fetchone()[0]
            
            # Get total doctors
            cursor.execute("SELECT COUNT(*) FROM doctors")
            stats.total_doctors = cursor.fetchone()[0]
            
            # Get total appointments
            cursor.execute("SELECT COUNT(*) FROM Appointment")
            stats.total_appointments = cursor.fetchone()[0]
            
            # Get total revenue (sum of successful payments)
            cursor.execute("""
                SELECT COALESCE(SUM(Amount), 0) 
                FROM payment 
                WHERE Status = 'Success'
            """)
            stats.total_revenue = float(cursor.fetchone()[0] or 0)
            
            # Get pending appointments
            cursor.execute("""
                SELECT COUNT(*) 
                FROM Appointment 
                WHERE Status = 'Pending'
            """)
            stats.pending_appointments = cursor.fetchone()[0]
            
            # Get today's appointments
            today = date.today()
            cursor.execute("""
                SELECT COUNT(*) 
                FROM Appointment 
                WHERE CAST(Appointment_Date AS DATE) = ?
            """, today)
            stats.today_appointments = cursor.fetchone()[0]
            
            # Get available doctors (assuming availability field)
            cursor.execute("""
                SELECT COUNT(*) 
                FROM doctors 
                WHERE availability IS NOT NULL AND availability != 'Off'
            """)
            stats.available_doctors = cursor.fetchone()[0]
            
            # Get low stock medicines (quantity < 50)
            cursor.execute("""
                SELECT COUNT(*) 
                FROM pharmacy 
                WHERE Quantity < 50
            """)
            stats.low_stock_medicines = cursor.fetchone()[0]
            
            return stats
            
        except pyodbc.Error as e:
            print(f"Error fetching dashboard stats: {e}")
            return None
        finally:
            cursor.close()
    
    def get_recent_activities(self, limit=10):
        """Get recent activities for dashboard"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        activities = []
        
        try:
            # Query for recent appointments
            cursor.execute("""
                SELECT TOP (?) 
                    a.Appointment_ID,
                    p.full_name as patient_name,
                    d.full_name as doctor_name,
                    a.Appointment_Date,
                    'Appointment ' + a.Status as action,
                    a.Appointment_Date as timestamp
                FROM Appointment a
                JOIN Patients p ON a.patient_id = p.patient_id
                JOIN doctors d ON a.doctor_id = d.doctor_id
                ORDER BY a.Appointment_Date DESC
            """, limit)
            
            for row in cursor.fetchall():
                activities.append(RecentActivity(
                    activity_id=row[0],
                    user_type="Patient",
                    user_name=row[1],
                    action=f"New appointment with Dr. {row[2]}",
                    timestamp=row[3],
                    icon="calendar"
                ))
            
            # Query for recent prescriptions
            cursor.execute("""
                SELECT TOP (?) 
                    pr.prescription_id,
                    p.full_name,
                    d.full_name,
                    pr.date_issued,
                    'Prescription Issued' as action,
                    pr.created_at
                FROM Prescription pr
                JOIN Patients p ON pr.patient_id = p.patient_id
                JOIN doctors d ON pr.doctor_id = d.doctor_id
                ORDER BY pr.created_at DESC
            """, limit // 2)
            
            for row in cursor.fetchall():
                activities.append(RecentActivity(
                    activity_id=row[0],
                    user_type="Doctor",
                    user_name=f"Dr. {row[2]}",
                    action=f"Prescribed medication for {row[1]}",
                    timestamp=row[5],
                    icon="file-medical"
                ))
            
            # Sort by timestamp and return limited results
            activities.sort(key=lambda x: x.timestamp, reverse=True)
            return activities[:limit]
            
        except pyodbc.Error as e:
            print(f"Error fetching recent activities: {e}")
            return []
        finally:
            cursor.close()
    
    def get_upcoming_appointments(self, user_role=None, user_id=None, limit=5):
        """Get upcoming appointments"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        appointments = []
        
        try:
            query = """
                SELECT TOP (?) 
                    a.Appointment_ID,
                    p.full_name as patient_name,
                    d.full_name as doctor_name,
                    a.Appointment_Date,
                    a.Status,
                    FORMAT(a.Appointment_Date, 'hh:mm tt') as time_slot
                FROM Appointment a
                JOIN Patients p ON a.patient_id = p.patient_id
                JOIN doctors d ON a.doctor_id = d.doctor_id
                WHERE a.Appointment_Date >= GETDATE()
                    AND a.Status IN ('Pending', 'Confirmed')
                ORDER BY a.Appointment_Date ASC
            """
            
            cursor.execute(query, limit)
            
            for row in cursor.fetchall():
                appointments.append(AppointmentSummary(
                    appointment_id=row[0],
                    patient_name=row[1],
                    doctor_name=row[2],
                    appointment_date=row[3],
                    status=row[4],
                    time_slot=row[5]
                ))
            
            return appointments
            
        except pyodbc.Error as e:
            print(f"Error fetching upcoming appointments: {e}")
            return []
        finally:
            cursor.close()
    
    def get_doctor_specialty_distribution(self):
        """Get distribution of doctors by specialty"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT specialty, COUNT(*) as count
                FROM doctors
                WHERE specialty IS NOT NULL
                GROUP BY specialty
                ORDER BY count DESC
            """)
            
            results = cursor.fetchall()
            return [{"specialty": row[0], "count": row[1]} for row in results]
            
        except pyodbc.Error as e:
            print(f"Error fetching doctor specialties: {e}")
            return []
        finally:
            cursor.close()
    
    def get_revenue_by_month(self):
        """Get revenue data by month for chart"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT 
                    FORMAT(Payment_Date, 'yyyy-MM') as month,
                    SUM(Amount) as revenue
                FROM payment
                WHERE Status = 'Success'
                    AND Payment_Date >= DATEADD(MONTH, -6, GETDATE())
                GROUP BY FORMAT(Payment_Date, 'yyyy-MM')
                ORDER BY month
            """)
            
            results = cursor.fetchall()
            return [{"month": row[0], "revenue": float(row[1] or 0)} for row in results]
            
        except pyodbc.Error as e:
            print(f"Error fetching revenue data: {e}")
            return []
        finally:
            cursor.close()