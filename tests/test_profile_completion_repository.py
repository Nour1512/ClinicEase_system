import pytest
from unittest.mock import patch, MagicMock
from repositories.profile_completion_repository import ProfileCompletionRepository

# -------------------------------
# Helper data
# -------------------------------

def fake_missing_fields_row():
    """
    Simulates SQL result where some fields are missing.
    Non-None values indicate MISSING fields (because of CASE WHEN logic).
    """
    return (
        None,              # full_name (exists → ignored later)
        None,              # email (exists → ignored later)
        "dob",             # dob missing
        "gender",          # gender missing
        None,              # address exists
        "emergency_contact",  # missing
        None               # medical_history exists
    )

def fake_complete_fields_row():
    """Simulates a fully completed profile"""
    return (None, None, None, None, None, None, None)

# -------------------------------
# Test get_missing_fields (missing fields)
# -------------------------------
@patch("repositories.profile_completion_repository.DatabaseConnection")
def test_get_missing_fields_with_missing_data(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = fake_missing_fields_row()

    repo = ProfileCompletionRepository()
    missing_fields = repo.get_missing_fields(1)

    assert "date_of_birth" in missing_fields
    assert "gender" in missing_fields
    assert "emergency_contact" in missing_fields

    # full_name and email must not appear
    assert "full_name" not in missing_fields
    assert "email" not in missing_fields

# -------------------------------
# Test get_missing_fields (no missing fields)
# -------------------------------
@patch("repositories.profile_completion_repository.DatabaseConnection")
def test_get_missing_fields_complete_profile(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = fake_complete_fields_row()

    repo = ProfileCompletionRepository()
    missing_fields = repo.get_missing_fields(1)

    assert missing_fields == []

# -------------------------------
# Test get_missing_fields (patient not found)
# -------------------------------
@patch("repositories.profile_completion_repository.DatabaseConnection")
def test_get_missing_fields_patient_not_found(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = None

    repo = ProfileCompletionRepository()
    missing_fields = repo.get_missing_fields(999)

    assert missing_fields == []

# -------------------------------
# Test update_patient_fields (valid update)
# -------------------------------
@patch("repositories.profile_completion_repository.DatabaseConnection")
def test_update_patient_fields(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = ProfileCompletionRepository()
    field_data = {
        "address": "Cairo",
        "gender": "Female"
    }

    repo.update_patient_fields(1, field_data)

    # Ensure SQL execution and commit happened
    mock_cursor.execute.assert_called_once()
    mock_conn.commit.assert_called_once()

# -------------------------------
# Test update_patient_fields (empty data)
# -------------------------------
@patch("repositories.profile_completion_repository.DatabaseConnection")
def test_update_patient_fields_empty_data(mock_db):
    repo = ProfileCompletionRepository()

    # Should exit early without DB calls
    repo.update_patient_fields(1, {})

    mock_db.assert_not_called()