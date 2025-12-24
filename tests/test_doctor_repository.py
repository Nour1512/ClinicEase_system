import pytest
from unittest.mock import patch, MagicMock
from repositories.doctor_repository import DoctorRepository
from models.doctor import Doctor

# -------------------------------
# Helper function to create a fake doctor row
# -------------------------------
def fake_doctor_row():
    return (1, "Dr Test", "test@doc.com", "pass", "Cardiology", "0123", "Mon", 4.5, 200, "2024-01-01")

def fake_doctor_columns():
    return [
        ("doctor_id",), ("full_name",), ("email",), ("password",),
        ("specialty",), ("phone",), ("availability",),
        ("rating",), ("price",), ("created_at",)
    ]

# -------------------------------
# Test get_doctor_by_email
# -------------------------------
@patch("repositories.doctor_repository.DatabaseConnection")
def test_get_doctor_by_email_found(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # Simulate a doctor being returned
    mock_cursor.fetchone.return_value = fake_doctor_row()
    mock_cursor.description = fake_doctor_columns()

    repo = DoctorRepository()
    doctor = repo.get_doctor_by_email("test@doc.com")

    assert doctor is not None
    assert doctor.email == "test@doc.com"

# -------------------------------
# Test get_doctor_by_email returns None
# -------------------------------
@patch("repositories.doctor_repository.DatabaseConnection")
def test_get_doctor_by_email_not_found(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = None
    mock_cursor.description = fake_doctor_columns()

    repo = DoctorRepository()
    doctor = repo.get_doctor_by_email("nonexistent@doc.com")
    assert doctor is None

# -------------------------------
# Test get_all_doctors
# -------------------------------
@patch("repositories.doctor_repository.DatabaseConnection")
def test_get_all_doctors(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # Simulate 2 doctors returned
    mock_cursor.fetchall.return_value = [fake_doctor_row(), fake_doctor_row()]
    mock_cursor.description = fake_doctor_columns()

    repo = DoctorRepository()
    doctors = repo.get_all_doctors()

    assert len(doctors) == 2
    assert all(isinstance(d, Doctor) for d in doctors)

# -------------------------------
# Test get_doctor_by_id
# -------------------------------
@patch("repositories.doctor_repository.DatabaseConnection")
def test_get_doctor_by_id(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = fake_doctor_row()
    mock_cursor.description = fake_doctor_columns()

    repo = DoctorRepository()
    doctor = repo.get_doctor_by_id(1)

    assert doctor is not None
    assert doctor.full_name == "Dr Test"

# -------------------------------
# Test search_doctors
# -------------------------------
@patch("repositories.doctor_repository.DatabaseConnection")
def test_search_doctors(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchall.return_value = [fake_doctor_row()]
    mock_cursor.description = fake_doctor_columns()

    repo = DoctorRepository()
    doctors = repo.search_doctors(specialty="Cardiology", name="Dr Test")

    assert len(doctors) == 1
    assert doctors[0].specialty == "Cardiology"

# -------------------------------
# Test get_total_doctors_count
# -------------------------------
@patch("repositories.doctor_repository.DatabaseConnection")
def test_get_total_doctors_count(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = (10,)

    repo = DoctorRepository()
    count = repo.get_total_doctors_count()

    assert count == 10

# -------------------------------
# Test get_available_today_count
# -------------------------------
@patch("repositories.doctor_repository.DatabaseConnection")
def test_get_available_today_count(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = (3,)

    repo = DoctorRepository()
    count = repo.get_available_today_count()

    assert count == 3
