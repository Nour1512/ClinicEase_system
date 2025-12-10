from core.db_singleton import DatabaseConnection
from datetime import datetime


class PaymentRepository:
    def create_payment(self, payment_data):
        db = DatabaseConnection().get_connection()
        cursor = db.cursor()
        payment_date = datetime.now()
        try:
            cursor.execute("""
                INSERT INTO payment (purchase_id, Amount, Payment_Method, Payment_Date, Status)
                VALUES (?, ?, ?, ?, ?)
            """, (
                payment_data['purchase_id'],
                payment_data['amount'],
                payment_data['payment_method'],
                payment_date,
                payment_data['status']
            ))
            db.commit()
            # cursor.execute("SELECT @@IDENTITY")
            cursor.execute("SELECT SCOPE_IDENTITY()")
            payment_id = cursor.fetchone()[0]
            return payment_id
        finally:
            cursor.close()
            db.close()