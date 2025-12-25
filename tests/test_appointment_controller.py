# tests/test_appointment_controller.py
from unittest.mock import patch, MagicMock
import json

# Test GET /appointments/Book
@patch("controllers.appointment_controller.repo")
def test_get_appointments(mock_repo, client):
    mock_appointment = MagicMock()
    mock_appointment.appointment_id = 1
    mock_appointment.patient_id = 2
    mock_appointment.patient_name = "John Doe"
    mock_appointment.doctor_id = 3
    mock_appointment.doctor_name = "Dr. Smith"
    mock_appointment.appointment_date = "2025-12-25"
    mock_appointment.status = "pending"
    mock_appointment.payment_status = "unpaid"
    mock_appointment.notes = "Checkup"
    mock_repo.get_appointments.return_value = [mock_appointment]

    response = client.get("/appointments/Book?doctor_id=3")
    assert response.status_code == 200
    data = response.get_json()
    assert data[0]["doctor_name"] == "Dr. Smith"
    mock_repo.get_appointments.assert_called_once_with("3")


# Test GET /appointments/api/appointments/role-based
@patch("controllers.appointment_controller.repo")
def test_get_role_based_appointments_patient(mock_repo, client):
    with client.session_transaction() as session:
        session["user_id"] = 2
        session["role"] = "patient"

    # ✅ Fix: Set ALL attributes to real values (not MagicMocks)
    mock_appointment = MagicMock()
    mock_appointment.appointment_id = 1
    mock_appointment.patient_id = 2
    mock_appointment.patient_name = "John Doe"
    mock_appointment.doctor_id = 3
    mock_appointment.doctor_name = "Dr. Smith"  # ← ADD THIS LINE
    mock_appointment.appointment_date = "2025-12-25"
    mock_appointment.status = "pending"
    mock_appointment.payment_status = "unpaid"
    mock_appointment.notes = "Checkup"
    mock_repo.get_patient_appointments.return_value = [mock_appointment]

    response = client.get("/appointments/api/appointments/role-based")
    assert response.status_code == 200
    mock_repo.get_patient_appointments.assert_called_once_with(patient_id=2)


# Test POST /appointments/ (create_appointment)
@patch("controllers.appointment_controller.repo")
def test_create_appointment_success(mock_repo, client):
    mock_repo.create_appointment.return_value = 1
    data = {
        "patient_id": 2,
        "doctor_id": 3,
        "appointment_date": "2025-12-25"
    }
    response = client.post("/appointments/", json=data)
    assert response.status_code == 201
    result = response.get_json()
    assert result["appointment_id"] == 1
    mock_repo.create_appointment.assert_called_once_with(
        patient_id=2, doctor_id=3, appointment_date="2025-12-25", notes=None
    )


# Test DELETE /appointments/<appointment_id>
@patch("controllers.appointment_controller.repo")
def test_delete_appointment(mock_repo, client):
    response = client.delete("/appointments/1")
    assert response.status_code == 200
    mock_repo.delete_appointment.assert_called_once_with(1)


# Test PUT /appointments/<appointment_id>/status
@patch("controllers.appointment_controller.repo")
def test_update_appointment_status(mock_repo, client):
    data = {"status": "confirmed"}
    response = client.put("/appointments/1/status", json=data)
    assert response.status_code == 200
    mock_repo.update_status.assert_called_once_with(1, "confirmed")


# Test GET /appointments/ (appointment_page)
def test_appointment_page(client):
    with client.session_transaction() as session:
        session["user_id"] = 1
        session["role"] = "patient"
    
    response = client.get("/appointments/")
    assert response.status_code == 200
    assert b"appointment" in response.data.lower()


# Test POST /book/book-appointment
def test_book_appointment_post(client):
    # ✅ Fix: Send correct booking form fields
    form_data = {
        "name": "John Doe",
        "phone": "1234567890", 
        "email": "john@example.com",
        "date": "2025-12-25",
        "time": "10:00",
        "area": "Downtown",
        "city": "Cairo", 
        "state": "Cairo",
        "post_code": "12345"
    }
    response = client.post("/book/book-appointment", data=form_data, follow_redirects=False)
    assert response.status_code == 200  # ← Change to 200
    assert b"successfully" in response.data.lower()  # ← Check success message


# Test GET /book/book-appointment
def test_book_appointment_get(client):
    response = client.get("/book/book-appointment")
    assert response.status_code == 200
    assert b"book" in response.data.lower()