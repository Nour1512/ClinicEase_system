import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime
from repositories.reset_pass_repository import ResetPassRepository

# -------------------------------
# Test save_reset_code
# -------------------------------
@patch("repositories.reset_pass_repository.DatabaseConnection")
def test_save_reset_code(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = ResetPassRepository()
    expires_at = datetime.now()

    repo.save_reset_code(
        email="test@example.com",
        code="123456",
        expires_at=expires_at
    )

    mock_cursor.execute.assert_called_once()
    mock_conn.commit.assert_called_once()
    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()

# -------------------------------
# Test get_reset_code (found)
# -------------------------------
@patch("repositories.reset_pass_repository.DatabaseConnection")
def test_get_reset_code_found(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    fake_row = ("123456", datetime.now(), 0)
    mock_cursor.fetchone.return_value = fake_row

    repo = ResetPassRepository()
    result = repo.get_reset_code("test@example.com")

    assert result is not None
    assert result[0] == "123456"
    assert result[2] == 0

    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()

# -------------------------------
# Test get_reset_code (not found)
# -------------------------------
@patch("repositories.reset_pass_repository.DatabaseConnection")
def test_get_reset_code_not_found(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = None

    repo = ResetPassRepository()
    result = repo.get_reset_code("missing@example.com")

    assert result is None

# -------------------------------
# Test mark_code_as_used
# -------------------------------
@patch("repositories.reset_pass_repository.DatabaseConnection")
def test_mark_code_as_used(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = ResetPassRepository()
    repo.mark_code_as_used("test@example.com")

    mock_cursor.execute.assert_called_once_with(
        """
                UPDATE password_resets SET used = 1 WHERE email = ?
            """,
        ("test@example.com",)
    )
    mock_conn.commit.assert_called_once()
    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()

# -------------------------------
# Test update_user_password
# -------------------------------
@patch("repositories.reset_pass_repository.DatabaseConnection")
def test_update_user_password(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = ResetPassRepository()
    repo.update_user_password(
        email="test@example.com",
        hashed_password="hashed_password_123"
    )

    mock_cursor.execute.assert_called_once_with(
        """
                UPDATE Patients SET password = ? WHERE email = ?
            """,
        ("hashed_password_123", "test@example.com")
    )
    mock_conn.commit.assert_called_once()
    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()