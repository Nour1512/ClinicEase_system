# repositories/reset_pass_repository.py
from core.db_singleton import DatabaseConnection
from datetime import datetime
import pyodbc

class ResetPassRepository:
    def __init__(self):
        self.db = DatabaseConnection()

    def save_reset_code(self, email: str, code: str, expires_at: datetime):
        """Save reset code to database"""
        conn = self.db.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO password_resets (email, reset_code, expires_at)
                VALUES (?, ?, ?)
            """, (email, code, expires_at))
            conn.commit()
        finally:
            cursor.close()
            conn.close()

    def get_reset_code(self, email: str):
        """Get latest unused reset code for email"""
        conn = self.db.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT reset_code, expires_at, used 
                FROM password_resets 
                WHERE email = ? 
                ORDER BY expires_at DESC
            """, (email,))
            return cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

    def mark_code_as_used(self, email: str):
        """Mark reset code as used"""
        conn = self.db.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE password_resets SET used = 1 WHERE email = ?
            """, (email,))
            conn.commit()
        finally:
            cursor.close()
            conn.close()

    def update_user_password(self, email: str, hashed_password: str):
        """Update password in Patients table"""
        conn = self.db.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE Patients SET password = ? WHERE email = ?
            """, (hashed_password, email))
            conn.commit()
        finally:
            cursor.close()
            conn.close()