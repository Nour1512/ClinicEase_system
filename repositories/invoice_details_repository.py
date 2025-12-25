from core.db_singleton import DatabaseConnection
from models.invoice_details import Invoice

class InvoiceRepository:
    def get_all_invoices(self):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            # LEFT JOIN prevents the "No invoices" error if patient data is missing
            cursor.execute("""
                SELECT p.purchase_id, pt.full_name, p.total_amount, p.status, p.purchase_date, pt.address
                FROM purchase p
                LEFT JOIN Patients pt ON p.patient_id = pt.patient_id
            """)
            rows = cursor.fetchall()
            return [Invoice(r[0], r[1], r[2], r[3], r[4], r[5]) for r in rows]
        except Exception as e:
            print(f"❌ Database fetch error: {e}")
            raise e
        finally:
            cursor.close()
            db.close()

    def get_invoice_by_id(self, invoice_id):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("""
                SELECT p.purchase_id, pt.full_name, p.total_amount, p.status, p.purchase_date, pt.address
                FROM purchase p
                LEFT JOIN Patients pt ON p.patient_id = pt.patient_id
                WHERE p.purchase_id = ?
            """, (invoice_id,))
            r = cursor.fetchone()
            if r:
                return Invoice(r[0], r[1], r[2], r[3], r[4], r[5])
            return None
        except Exception as e:
            print(f"❌ Database fetch error: {e}")
            raise e
        finally:
            cursor.close()
            db.close()