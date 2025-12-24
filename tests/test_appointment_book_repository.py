import pytest
from unittest.mock import patch, MagicMock
from repositories.bookApp_repository import AppointmentRepository_book
@patch("repositories.bookApp_repository.DatabaseConnection")
def test_add_appointment_success(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.rowcount = 1  # simulate successful insert

    appointment = MagicMock()
    appointment.name = "John Doe"
    appointment.phone = "0123456789"
    appointment.email = "john@test.com"
    appointment.date = "2025-01-01"
    appointment.time = "10:00"
    appointment.area = "Downtown"
    appointment.city = "Cairo"
    appointment.state = "Giza"
    appointment.post_code = "12345"

    repo = AppointmentRepository_book()
    result = repo.add_appointment(appointment)

    assert result is True
    mock_cursor.execute.assert_called_once()
    mock_conn.commit.assert_called_once()
@patch("repositories.bookApp_repository.DatabaseConnection")
def test_add_appointment_no_rows_affected(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.rowcount = 0  # simulate failed insert

    appointment = MagicMock()
    appointment.name = "John Doe"
    appointment.phone = "0123456789"
    appointment.email = "john@test.com"
    appointment.date = "2025-01-01"
    appointment.time = "10:00"
    appointment.area = "Downtown"
    appointment.city = "Cairo"
    appointment.state = "Giza"
    appointment.post_code = "12345"

    repo = AppointmentRepository_book()

    with pytest.raises(Exception, match="Insert failed"):
        repo.add_appointment(appointment)

    mock_conn.rollback.assert_called_once()
@patch("repositories.bookApp_repository.DatabaseConnection")
def test_add_appointment_db_exception(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.execute.side_effect = Exception("DB error")

    appointment = MagicMock()
    appointment.name = "John Doe"
    appointment.phone = "0123456789"
    appointment.email = "john@test.com"
    appointment.date = "2025-01-01"
    appointment.time = "10:00"
    appointment.area = "Downtown"
    appointment.city = "Cairo"
    appointment.state = "Giza"
    appointment.post_code = "12345"

    repo = AppointmentRepository_book()

    with pytest.raises(Exception, match="DB error"):
        repo.add_appointment(appointment)

    mock_conn.rollback.assert_called_once()
