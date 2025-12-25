# tests/test_doctor_controller.py
from unittest.mock import patch, MagicMock

# Test the doctors_page route
@patch("controllers.doctor_controller.doctor_repo")
def test_doctors_page_logged_in(mock_repo, client):
    # Mock session to simulate logged-in user
    client.get("/login")  # Ensure login route exists in your test setup
    mock_repo.get_all_doctors.return_value = []
    
    with client.session_transaction() as session:
        session["user_id"] = 1  # Simulate a logged-in user

    response = client.get("/doctors")
    assert response.status_code == 200
    assert b"Doctors" in response.data  # Assuming your template has this text


@patch("controllers.doctor_controller.doctor_repo")
def test_doctors_page_not_logged_in(mock_repo, client):
    response = client.get("/doctors", follow_redirects=False)
    assert response.status_code == 302  # Redirect
    assert "/login" in response.headers["Location"]


@patch("controllers.doctor_controller.doctor_repo")
def test_api_get_doctors(mock_repo, client):
    # Create a mock doctor object
    mock_doctor = MagicMock()
    mock_doctor.to_dict.return_value = {
        "id": 1,
        "name": "Dr. Smith",
        "specialty": "Cardiology"
    }
    mock_repo.get_all_doctors.return_value = [mock_doctor]

    response = client.get("/api/doctors")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["doctors"][0]["name"] == "Dr. Smith"
    assert data["total"] == 1


@patch("controllers.doctor_controller.doctor_repo")
def test_search_doctors(mock_repo, client):
    mock_doctor = MagicMock()
    mock_doctor.to_dict.return_value = {
        "id": 2,
        "name": "Dr. Alice",
        "specialty": "Dermatology"
    }
    mock_repo.search_doctors.return_value = [mock_doctor]

    response = client.get("/api/doctors/search?name=Alice")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["doctors"][0]["name"] == "Dr. Alice"