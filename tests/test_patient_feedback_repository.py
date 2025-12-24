# tests/test_patient_feedback_repository.py
from unittest.mock import patch, MagicMock
from repositories.p_feedback_repositor import PatientFeedbackRepository
from models.p_feedback import PatientFeedback
from datetime import datetime

# --------------------------
# Test save_feedback
# --------------------------
@patch("repositories.p_feedback_repositor.DatabaseConnection")
def test_save_feedback(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    feedback = PatientFeedback(
        patient_name="John Doe",
        gender="Male",
        doctor_knowledge=5,
        doctor_kindness=4,
        nurse_patience=5,
        nurse_knowledge=4,
        waiting_time=3,
        hygiene=5,
        improvement_suggestions="Improve waiting area",
        overall_rating=4.5,
        submission_date=datetime(2025, 1, 1, 10, 0),
        status="Submitted"
    )

    repo = PatientFeedbackRepository()
    result = repo.save_feedback(feedback)

    assert result is True
    mock_cursor.execute.assert_called_once()
    mock_conn.commit.assert_called_once()
    mock_conn.close.assert_called_once()

# --------------------------
# Test get_all_feedback
# --------------------------
@patch("repositories.p_feedback_repositor.DatabaseConnection")
def test_get_all_feedback(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchall.return_value = [
        (1, "John Doe", "Male", 5, 4, 5, 4, 3, 5, "Improve waiting area", 4.5, datetime(2025,1,1,10,0), "Submitted")
    ]
    mock_cursor.description = [
        ("id",), ("patient_name",), ("gender",), ("doctor_knowledge",), ("doctor_kindness",),
        ("nurse_patience",), ("nurse_knowledge",), ("waiting_time",), ("hygiene",),
        ("improvement_suggestions",), ("overall_rating",), ("submission_date",), ("status",)
    ]

    repo = PatientFeedbackRepository()
    feedback_list = repo.get_all_feedback()

    assert len(feedback_list) == 1
    assert feedback_list[0]["patient_name"] == "John Doe"
    mock_conn.close.assert_called_once()

# --------------------------
# Test get_feedback_stats
# --------------------------
@patch("repositories.p_feedback_repositor.DatabaseConnection")
def test_get_feedback_stats(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = (4.5, 4.0, 5.0, 4.0, 3.5, 4.5)

    repo = PatientFeedbackRepository()
    stats = repo.get_feedback_stats()

    expected_keys = [
        'doctor_knowledge', 'doctor_kindness', 'nurse_patience',
        'nurse_knowledge', 'waiting_time', 'hygiene'
    ]

    assert all(k in stats for k in expected_keys)
    assert stats['doctor_knowledge'] == 4.5
    assert stats['waiting_time'] == 3.5
    mock_conn.close.assert_called_once()
