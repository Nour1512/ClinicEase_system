# tests/test_patient_api.py
from unittest.mock import patch , MagicMock

@patch("controllers.patient_controller.patient_repo")
def test_api_get_patients_admin(mock_repo, client):
    with client.session_transaction() as sess:
        sess["role"] = "admin"
    
    mock_repo.get_all_patients.return_value = [
        MagicMock(patient_id=1, full_name="John", email="j@test.com", dob="1990-01-01", gender="M", address="123", emergency_contact="Jane", medical_history="None")
    ]
    response = client.get("/api/patients")
    assert response.status_code == 200
    assert b"John" in response.data




# @patch("controllers.patient_controller.patient_repo")
# def test_api_get_patients_doctor(mock_repo, client):
#     with client.session_transaction() as sess:
#         sess["role"] = "doctor"
#         sess["user_id"] = 2
    
#     mock_repo.get_patients_by_doctor.return_value = [  # ← Doctor-specific method
#         MagicMock(patient_id=1, full_name="John", ...)
#     ]
#     response = client.get("/patients/api/patients")
#     assert response.status_code == 200
#     assert b"John" in response.data





from unittest.mock import patch, MagicMock

@patch("controllers.patient_controller.patient_repo")
def test_api_get_patients_doctor(mock_repo, client):
    # Simulate logged-in doctor session
    with client.session_transaction() as sess:
        sess["role"] = "doctor"
        sess["user_id"] = 2
    
    # Create a mock patient object with ALL required attributes
    mock_patient = MagicMock()
    mock_patient.patient_id = 1
    mock_patient.full_name = "John Doe"
    mock_patient.email = "john@test.com"
    mock_patient.medical_history = "None"
    mock_patient.address = "123 Main St"
    mock_patient.dob = "1990-01-01"
    mock_patient.gender = "Male"
    mock_patient.emergency_contact = "Jane Doe (555-1234)"
    
    # Mock the repository method to return our patient
    mock_repo.get_patients_by_doctor.return_value = [mock_patient]
    
    # Call the API endpoint
    response = client.get("/api/patients")
    
    # Verify response
    assert response.status_code == 200
    assert b"John Doe" in response.data
    assert b"123 Main St" in response.data  # Verify other fields are included