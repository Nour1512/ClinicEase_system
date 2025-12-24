# tests/test_notification_repository.py
from unittest.mock import patch, MagicMock
from repositories.notifications_repository import NotificationRepository
from datetime import datetime

# --------------------------
# Test get_notifications
# --------------------------
@patch("repositories.notifications_repository.DatabaseConnection")
def test_get_notifications_patient(mock_db_class):
    # Mock DB objects
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # Mock DB rows
    mock_cursor.fetchall.return_value = [
        (1, 10, 5, None, "Info", "Appointment scheduled", datetime(2025, 1, 1, 10, 0), "Unread")
    ]
    mock_cursor.description = [
        ("notification_id",), ("patient_id",), ("doctor_id",), ("admin_id",),
        ("type",), ("message",), ("date_sent",), ("status",)
    ]

    repo = NotificationRepository()
    notifications = repo.get_notifications(user_id=10, role="patient")

    assert len(notifications) == 1
    assert notifications[0]["patient_id"] == 10
    assert notifications[0]["status"] == "Unread"
    assert notifications[0]["formatted_date"] == "Jan 01, 2025 10:00 AM"

# --------------------------
# Test count_unread
# --------------------------
@patch("repositories.notifications_repository.DatabaseConnection")
def test_count_unread_doctor(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = (3,)  # 3 unread notifications

    repo = NotificationRepository()
    count = repo.count_unread(user_id=5, role="doctor")

    assert count == 3

# --------------------------
# Test mark_as_read
# --------------------------
@patch("repositories.notifications_repository.DatabaseConnection")
def test_mark_as_read(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = NotificationRepository()
    repo.mark_as_read(notification_id=7)

    mock_cursor.execute.assert_called_once_with(
        "UPDATE Notifications SET status = 'Read' WHERE notification_id = ?", 7
    )
    mock_conn.commit.assert_called_once()

# --------------------------
# Test mark_all_as_read
# --------------------------
@patch("repositories.notifications_repository.DatabaseConnection")
def test_mark_all_as_read_admin(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = NotificationRepository()
    repo.mark_all_as_read(user_id=1, role="admin")

    mock_cursor.execute.assert_called_once_with(
        "UPDATE Notifications SET status = 'Read' WHERE admin_id = ?", 1
    )
    mock_conn.commit.assert_called_once()
