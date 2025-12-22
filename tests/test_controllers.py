# tests/test_controllers.py
from unittest.mock import patch, MagicMock

@patch("controllers.auth_controller.find_user_by_email")
def test_login_patient_success(mock_find, client):
    mock_patient = MagicMock()
    mock_patient.patient_id = 1
    mock_patient.full_name = "John"
    mock_patient.password = "pass123"
    mock_find.return_value = (mock_patient, "patient")

    response = client.post("/login", data={
        "email": "j@test.com",
        "password": "pass123"
    }, follow_redirects=True)
    
    # assert response.status_code == 302
    # assert "/pharmacy" in response.headers["Location"]

    assert response.status_code == 200
    assert b"Medicine Grid" in response.data

@patch("controllers.admin_controller.patient_repo")
def test_admin_patients_access(mock_repo, client):
    with client.session_transaction() as sess:
        sess["role"] = "admin"
    
    mock_repo.get_all_patients.return_value = []
    response = client.get("/admin/patients")
    
    assert response.status_code == 200
    assert b"Admin Portal" in response.data



# @patch("controllers.doctor_controller.patient_repo")
# def test_doctor_patients_access(mock_repo, client):
#     # Simulate logged-in doctor
#     with client.session_transaction() as sess:
#         sess["role"] = "doctor"
#         sess["user_id"] = 2
    
#     # Mock repository response
#     mock_repo.get_patients_by_doctor.return_value = []
    
#     # Test access to doctor's patients page
#     response = client.get("/admin/patients")
    
#     assert response.status_code == 200
#     assert b"Doctors Portal" in response.data  # Or whatever your doctor template contains









@patch("controllers.patient_controller.patient_repo")
def test_doctor_patients_access(mock_repo, client):
    # Simulate logged-in doctor
    with client.session_transaction() as sess:
        sess["role"] = "doctor"
        sess["user_id"] = 2
    
    # Mock repository response
    mock_repo.get_patients_by_doctor.return_value = []
    
    # ✅ Hit the SHARED patients route (not /admin/patients)
    response = client.get("/patients")
    
    assert response.status_code == 200
    # ✅ Check for DOCTOR-SPECIFIC content in the shared template
    assert b"Patient Dashboard - Patient List" in response.data  # Doctor page title
    assert b"My Patients" in response.data  # Doctor sidebar subtitle