from core.db_singleton import DatabaseConnection

class PurchaseRepository:
    def create_purchase(self, patient_id, total_amount):
        db = DatabaseConnection().get_connection()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO purchase (patient_id, total_amount, status)
            VALUES (?, ?, 'Pending')
            SELECT SCOPE_IDENTITY() AS purchase_id
        """, (patient_id, total_amount))
        purchase_id = cursor.fetchone()[0]
        db.commit()
        cursor.close()
        db.close()
        return purchase_id

    def get_purchase_by_id(self, purchase_id):
        db = DatabaseConnection().get_connection()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM purchase WHERE purchase_id = ?", (purchase_id,))
        row = cursor.fetchone()
        cursor.close()
        db.close()
        if row:
            columns = [col[0] for col in cursor.description]
            return dict(zip(columns, row))
        return None

    def update_purchase_status(self, purchase_id, status):
        db = DatabaseConnection().get_connection()
        cursor = db.cursor()
        cursor.execute("UPDATE purchase SET status = ? WHERE purchase_id = ?", (status, purchase_id))
        db.commit()
        cursor.close()
        db.close()


# In purchase_repository.py
def create_purchase(self, patient_id, total_amount):
    db = DatabaseConnection().get_connection()
    cursor = db.cursor()
    try:
        cursor.execute("""
            INSERT INTO purchase (patient_id, total_amount, status)
            VALUES (?, ?, 'Pending')
            SELECT SCOPE_IDENTITY() AS purchase_id
        """, (patient_id, total_amount))
        purchase_id = cursor.fetchone()[0]
        db.commit()
        return purchase_id
    finally:
        cursor.close()
        db.close()