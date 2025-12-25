from decimal import Decimal
from core.db_singleton import DatabaseConnection

class AdminFeedbackRepository:
    def get_all_feedback(self):
        db = DatabaseConnection().get_connection()
        cursor = None
        try:
            cursor = db.cursor()
            cursor.execute("""
                SELECT 
                    Id, AdminName, Comments, Author,
                    Rating, Review, PatientInfo,
                    SubmittedOn, Status, Actions
                FROM admin_feedback
                ORDER BY SubmittedOn DESC
            """)

            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

            result = []
            for row in rows:
                record = dict(zip(columns, row))

                if record["SubmittedOn"]:
                    record["SubmittedOn"] = record["SubmittedOn"].strftime("%Y-%m-%d %H:%M")

                if isinstance(record["Rating"], Decimal):
                    record["Rating"] = float(record["Rating"])
                elif record["Rating"] is None:
                    record["Rating"] = None

                result.append(record)

            return result

        except Exception as e:
            print("DB ERROR (get_all_feedback):", e)
            return []

        finally:
            if cursor:
                cursor.close()
            db.close()
    def update_feedback(self, f_id, admin, comments, status):
        db = DatabaseConnection().get_connection()
        cursor = None
        try:
            
            cursor = db.cursor()
            cursor.execute("""
                UPDATE admin_feedback
                SET AdminName = ?, Comments = ?, Status = ?
                WHERE Id = ?
            """, (admin, comments, status, f_id))
            db.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print("DB ERROR (update_feedback):", e)
            return False
        finally:
            if cursor:
                cursor.close()
            db.close()
