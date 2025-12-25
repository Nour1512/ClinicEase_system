import pytest
from unittest.mock import patch, MagicMock
from repositories.settings_repository import SettingsRepository

# -------------------------------
# Test Change_Password
# -------------------------------
@patch("repositories.settings_repository.DatabaseConnection")
def test_change_password(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = SettingsRepository()
    repo.Change_Password(user_id=1, new_password="new_pass_123")

    mock_cursor.execute.assert_called_once_with(
        "UPDATE Patients SET password = ? WHERE patient_id = ?",
        ("new_pass_123", 1)
    )
    mock_conn.commit.assert_called_once()
    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()

# -------------------------------
# Test change_email
# -------------------------------
@patch("repositories.settings_repository.DatabaseConnection")
def test_change_email(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = SettingsRepository()
    repo.change_email(user_id=1, new_email="new@email.com")

    mock_cursor.execute.assert_called_once_with(
        "UPDATE Patients SET email = ? WHERE patient_id = ?",
        ("new@email.com", 1)
    )
    mock_conn.commit.assert_called_once()
    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()

# -------------------------------
# Test change_name
# -------------------------------
@patch("repositories.settings_repository.DatabaseConnection")
def test_change_name(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = SettingsRepository()
    repo.change_name(user_id=1, new_name="New Name")

    mock_cursor.execute.assert_called_once_with(
        "UPDATE Patients SET full_name = ? WHERE patient_id = ?",
        ("New Name", 1)
    )
    mock_conn.commit.assert_called_once()

# -------------------------------
# Test get_by_id (found)
# -------------------------------
@patch("repositories.settings_repository.DatabaseConnection")
def test_get_by_id_found(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = (1, "Test User", "test@email.com")

    repo = SettingsRepository()
    user = repo.get_by_id(1)

    assert user is not None
    assert user["patient_id"] == 1
    assert user["full_name"] == "Test User"
    assert user["email"] == "test@email.com"

    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()

# -------------------------------
# Test get_by_id (not found)
# -------------------------------
@patch("repositories.settings_repository.DatabaseConnection")
def test_get_by_id_not_found(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = None

    repo = SettingsRepository()
    user = repo.get_by_id(999)

    assert user is None