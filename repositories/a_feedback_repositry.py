from core.db_singleton import DatabaseConnection

class AdminFeedbackRepository:
    def __init__(self):
        self.db = DatabaseConnection()

    def get_all_feedback(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM admin_feedback ORDER BY SubmittedOn DESC")

        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()

        result = []
        for row in rows:
            record = dict(zip(columns, row))

            # FIX datetime → string
            if record.get("SubmittedOn"):
                record["SubmittedOn"] = record["SubmittedOn"].strftime("%Y-%m-%d")

            result.append(record)

        cursor.close()
        conn.close()
        return result

    def update_feedback(self, id, admin, comments, status):
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE admin_feedback
            SET AdminName = ?, Comments = ?, Status = ?
            WHERE Id = ?
        """, (admin, comments, status, id))

        conn.commit()
        cursor.close()
        conn.close()
