from unittest.mock import patch, MagicMock
from repositories.appointment_repository import AppointmentRepository
from models.appointment import Appointment
@patch("repositories.appointment_repository.DatabaseConnection")
def test_get_appointments_admin(mock_db_class):
    # Mock DB objects
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # Mock DB rows
    mock_cursor.fetchall.return_value = [
        (
            1, 10, "John Doe", 5, "Dr. Smith",
            "2025-01-01", "Pending", "Unpaid", "Initial checkup"
        )
    ]

    mock_cursor.description = [
        ("Appointment_ID",),
        ("patient_id",),
        ("patient_name",),
        ("doctor_id",),
        ("doctor_name",),
        ("Appointment_Date",),
        ("Status",),
        ("Payment_Status",),
        ("Notes",),
    ]

    repo = AppointmentRepository()
    appointments = repo.get_appointments()

    assert len(appointments) == 1
    assert isinstance(appointments[0], Appointment)
    assert appointments[0].patient_name == "John Doe"
    assert appointments[0].doctor_name == "Dr. Smith"
@patch("repositories.appointment_repository.DatabaseConnection")
def test_get_appointments_by_doctor(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchall.return_value = [
        (
            2, 11, "Jane Doe", 3, "Dr. Adams",
            "2025-02-01", "Confirmed", "Paid", "Follow-up"
        )
    ]

    mock_cursor.description = [
        ("Appointment_ID",),
        ("patient_id",),
        ("patient_name",),
        ("doctor_id",),
        ("doctor_name",),
        ("Appointment_Date",),
        ("Status",),
        ("Payment_Status",),
        ("Notes",),
    ]

    repo = AppointmentRepository()
    appointments = repo.get_appointments(doctor_id=3)

    assert len(appointments) == 1
    assert appointments[0].doctor_id == 3
    assert appointments[0].status == "Confirmed"
@patch("repositories.appointment_repository.DatabaseConnection")
def test_create_appointment(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # Mock inserted appointment ID
    mock_cursor.fetchone.return_value = (99,)

    repo = AppointmentRepository()
    appointment_id = repo.create_appointment(
        patient_id=1,
        doctor_id=2,
        appointment_date="2025-03-01",
        notes="Test appointment"
    )

    assert appointment_id == 99
    mock_conn.commit.assert_called_once()
@patch("repositories.appointment_repository.DatabaseConnection")
def test_update_appointment_status(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = AppointmentRepository()
    repo.update_status(appointment_id=5, status="Completed")

    mock_cursor.execute.assert_called_once()
    mock_conn.commit.assert_called_once()
@patch("repositories.appointment_repository.DatabaseConnection")
def test_delete_appointment(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = AppointmentRepository()
    repo.delete_appointment(appointment_id=7)

    mock_cursor.execute.assert_called_once()
    mock_conn.commit.assert_called_once()
@patch("repositories.appointment_repository.DatabaseConnection")
def test_get_patient_appointments(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchall.return_value = [
        (
            3, 20, "Ahmed Ali", 4, "Dr. Hassan",
            "2025-04-01", "Pending", "Unpaid", "Routine check"
        )
    ]

    mock_cursor.description = [
        ("Appointment_ID",),
        ("patient_id",),
        ("patient_name",),
        ("doctor_id",),
        ("doctor_name",),
        ("Appointment_Date",),
        ("Status",),
        ("Payment_Status",),
        ("Notes",),
    ]

    repo = AppointmentRepository()
    appointments = repo.get_patient_appointments(patient_id=20)

    assert len(appointments) == 1
    assert appointments[0].patient_id == 20
    assert appointments[0].doctor_name == "Dr. Hassan"
