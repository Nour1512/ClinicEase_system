from core.db_singleton import DatabaseConnection

class NotificationRepository:
    def __init__(self):
        self.db = DatabaseConnection()

    def get_notifications(self, user_id, role):
        conn = self.db.get_connection()
        cursor = conn.cursor()

        if role == "patient":
            cursor.execute("""
                SELECT notification_id, patient_id, doctor_id, admin_id, type, message, date_sent, status
                FROM Notifications
                WHERE patient_id = ?
                ORDER BY date_sent DESC
            """, user_id)
        elif role == "doctor":
            cursor.execute("""
                SELECT notification_id, patient_id, doctor_id, admin_id, type, message, date_sent, status
                FROM Notifications
                WHERE doctor_id = ?
                ORDER BY date_sent DESC
            """, user_id)
        else:  # admin
            cursor.execute("""
                SELECT notification_id, patient_id, doctor_id, admin_id, type, message, date_sent, status
                FROM Notifications
                WHERE admin_id = ?
                ORDER BY date_sent DESC
            """, user_id)

        rows = cursor.fetchall()
        cols = [column[0] for column in cursor.description]
        notifications = [dict(zip(cols, row)) for row in rows]

        # Format date for display
        for n in notifications:
            n["formatted_date"] = n["date_sent"].strftime("%b %d, %Y %I:%M %p")

        return notifications

    def count_unread(self, user_id, role):
        conn = self.db.get_connection()
        cursor = conn.cursor()

        if role == "patient":
            cursor.execute("""
                SELECT COUNT(*) FROM Notifications
                WHERE patient_id = ? AND status = 'Unread'
            """, user_id)
        elif role == "doctor":
            cursor.execute("""
                SELECT COUNT(*) FROM Notifications
                WHERE doctor_id = ? AND status = 'Unread'
            """, user_id)
        else:
            cursor.execute("""
                SELECT COUNT(*) FROM Notifications
                WHERE admin_id = ? AND status = 'Unread'
            """, user_id)

        return cursor.fetchone()[0]

    def mark_as_read(self, notification_id):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE Notifications SET status = 'Read' WHERE notification_id = ?", notification_id)
        conn.commit()

    def mark_all_as_read(self, user_id, role):
        conn = self.db.get_connection()
        cursor = conn.cursor()

        if role == "patient":
            cursor.execute("UPDATE Notifications SET status = 'Read' WHERE patient_id = ?", user_id)
        elif role == "doctor":
            cursor.execute("UPDATE Notifications SET status = 'Read' WHERE doctor_id = ?", user_id)
        else:
            cursor.execute("UPDATE Notifications SET status = 'Read' WHERE admin_id = ?", user_id)

        conn.commit()