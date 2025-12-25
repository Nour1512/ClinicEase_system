# tests/test_bookApp_controller.py
from unittest.mock import patch, MagicMock

# Test GET /book-appointment
def test_book_appointment_get(client):
    response = client.get("/book/book-appointment")
    assert response.status_code == 200
    assert b"Book Appointment" in response.data  # Assuming your template contains this text


# Test POST /book-appointment (successful booking)
@patch("controllers.bookApp_controller.repo")
def test_book_appointment_post_success(mock_repo, client):
    mock_repo.add_appointment.return_value = True  # Simulate successful DB insert

    form_data = {
        "name": "John Doe",
        "phone": "1234567890",
        "email": "john@example.com",
        "date": "2025-12-30",
        "time": "10:00",
        "area": "Downtown",
        "city": "Cairo",
        "state": "Cairo",
        "post_code": "12345"
    }

    response = client.post("/book/book-appointment", data=form_data)
    assert response.status_code == 200
    assert b"Appointment booked successfully" in response.data
    mock_repo.add_appointment.assert_called_once()


# Test POST /book-appointment (exception in repository)
@patch("controllers.bookApp_controller.repo")
def test_book_appointment_post_exception(mock_repo, client):
    mock_repo.add_appointment.side_effect = Exception("Database error")

    form_data = {
        "name": "John Doe",
        "phone": "1234567890",
        "email": "john@example.com",
        "date": "2025-12-30",
        "time": "10:00",
        "area": "Downtown",
        "city": "Cairo",
        "state": "Cairo",
        "post_code": "12345"
    }

    response = client.post("/book/book-appointment", data=form_data)
    assert response.status_code == 500
    assert b"Error: Database error" in response.data