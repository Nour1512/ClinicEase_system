# tests/test_patients_details_controller.py
from unittest.mock import patch, MagicMock

# Test GET /patient_details/<patient_id> when logged in and patient exists
@patch("controllers.patients_details_controller.repo")
def test_patient_details_page_exists(mock_repo, client):
    with client.session_transaction() as session:
        session["user_id"] = 1
        session["role"] = "doctor"

    mock_patient = MagicMock()
    mock_repo.get_patient_detail_by_id.return_value = mock_patient

    response = client.get("/patients_details/patient_details/1")
    assert response.status_code == 200
    mock_repo.get_patient_detail_by_id.assert_called_once_with(1)
    # Check if template likely contains patient info
    assert b"patient" in response.data or b"Patient" in response.data


# Test GET /patient_details/<patient_id> when not logged in
def test_patient_details_page_not_logged_in(client):
    with client.session_transaction() as session:
        session.clear()

    response = client.get("/patients_details/patient_details/1", follow_redirects=False)
    assert response.status_code == 302
    assert "/login" in response.headers["Location"]


# Test GET /patient_details/<patient_id> when patient not found
@patch("controllers.patients_details_controller.repo")
def test_patient_details_page_not_found(mock_repo, client):
    with client.session_transaction() as session:
        session["user_id"] = 1
        session["role"] = "doctor"

    mock_repo.get_patient_detail_by_id.return_value = None

    response = client.get("/patients_details/patient_details/1")
    assert response.status_code == 200
    assert b"Patient details not found" in response.data or b"patient" in response.data


# Test POST /patient_details/<patient_id>/update
@patch("controllers.patients_details_controller.repo")
def test_update_patient_details(mock_repo, client):
    with client.session_transaction() as session:
        session["user_id"] = 1

    form_data = {
        "blood_type": "A+",
        "height_cm": "180",
        "weight_kg": "75",
        "medical_record": "None",
        "current_medications": "None",
        "medical_notes": "N/A",
        "emergency_contact_name": "Jane Doe",
        "emergency_contact_phone": "1234567890"
    }

    response = client.post("/patients_details/patient_details/1/update", data=form_data, follow_redirects=False)
    assert response.status_code == 302
    assert "/patients_details/patient_details/1" in response.headers["Location"]
    mock_repo.update_patient_details.assert_called_once()


# Test POST /patient_details/<patient_id>/add successful
@patch("controllers.patients_details_controller.repo")
def test_add_patient_details_success(mock_repo, client):
    with client.session_transaction() as session:
        session["user_id"] = 1

    form_data = {
        "blood_type": "A+",
        "height_cm": "180",
        "weight_kg": "75",
        "medical_record": "None",
        "current_medications": "None",
        "medical_notes": "N/A",
        "emergency_contact_name": "Jane Doe",
        "emergency_contact_phone": "1234567890"
    }

    response = client.post("/patients_details/patient_details/1/add", data=form_data, follow_redirects=False)
    assert response.status_code == 302
    assert "/patients_details/patient_details/1" in response.headers["Location"]
    mock_repo.add_patient_details.assert_called_once()


# Test POST /patient_details/<patient_id>/add missing field
def test_add_patient_details_missing_field(client):
    with client.session_transaction() as session:
        session["user_id"] = 1

    form_data = {
        "blood_type": "",
        "height_cm": "180",
        "weight_kg": "75",
        "medical_record": "None",
        "current_medications": "None",
        "medical_notes": "N/A",
        "emergency_contact_name": "Jane Doe",
        "emergency_contact_phone": "1234567890"
    }

    response = client.post("/patients_details/patient_details/1/add", data=form_data, follow_redirects=False)
    assert response.status_code == 302
    assert "/patients_details/patient_details/1" in response.headers["Location"]