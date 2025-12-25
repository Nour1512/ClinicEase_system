# # tests/test_profile_completion.py
# from unittest.mock import patch, MagicMock
# import pytest

# # Test: User not logged in
# def test_get_missing_profile_fields_not_logged_in(client):
#     with client.session_transaction() as session:
#         session.clear()
#     from controllers.profile_completion_controller import get_missing_profile_fields
#     result = get_missing_profile_fields()
#     assert result is None


# # Test: User not a patient
# def test_get_missing_profile_fields_not_patient(client):
#     with client.session_transaction() as session:
#         session["user_id"] = 1
#         session["role"] = "doctor"
#     from controllers.profile_completion_controller import get_missing_profile_fields
#     result = get_missing_profile_fields()
#     assert result is None


# # Test: Patient with missing fields
# @patch("controllers.profile_completion_controller.PatientRepository")
# def test_get_missing_profile_fields_missing(mock_patient_repo, client):
#     with client.session_transaction() as session:
#         session["user_id"] = 1
#         session["role"] = "patient"

#     mock_patient = MagicMock()
#     mock_patient.dob = None  # Missing
#     mock_patient.gender = "Male"
#     mock_patient.address = "123 Street"
#     mock_patient.emergency_contact = None  # Missing
#     mock_patient.medical_history = "None"
#     mock_patient_repo.return_value.get_patient_by_id.return_value = mock_patient

#     from controllers.profile_completion_controller import get_missing_profile_fields
#     result = get_missing_profile_fields()
#     assert result is True


# # Test: Patient with all fields filled
# @patch("controllers.profile_completion_controller.PatientRepository")
# def test_get_missing_profile_fields_complete(mock_patient_repo, client):
#     with client.session_transaction() as session:
#         session["user_id"] = 1
#         session["role"] = "patient"

#     mock_patient = MagicMock()
#     mock_patient.dob = "1990-01-01"
#     mock_patient.gender = "Male"
#     mock_patient.address = "123 Street"
#     mock_patient.emergency_contact = "9876543210"
#     mock_patient.medical_history = "None"
#     mock_patient_repo.return_value.get_patient_by_id.return_value = mock_patient

#     from controllers.profile_completion_controller import get_missing_profile_fields
#     result = get_missing_profile_fields()
#     assert result is False










# tests/test_profile_completion.py
from unittest.mock import patch, MagicMock
import pytest

# Test: Patient with missing fields
@patch("controllers.profile_completion_controller.PatientRepository")
def test_check_missing_fields_missing(mock_repo):
    mock_patient = MagicMock()
    mock_patient.dob = None  # Missing
    mock_patient.gender = "Male"
    mock_patient.address = "123 Street"
    mock_patient.emergency_contact = None  # Missing
    mock_patient.medical_history = "None"
    mock_repo.return_value.get_patient_by_id.return_value = mock_patient
    
    from controllers.profile_completion_controller import _check_missing_fields
    result = _check_missing_fields(1)
    assert result is True


# Test: Patient with all fields filled
@patch("controllers.profile_completion_controller.PatientRepository")
def test_check_missing_fields_complete(mock_repo):
    mock_patient = MagicMock()
    mock_patient.dob = "1990-01-01"
    mock_patient.gender = "Male"
    mock_patient.address = "123 Street"
    mock_patient.emergency_contact = "9876543210"
    mock_patient.medical_history = "None"
    mock_repo.return_value.get_patient_by_id.return_value = mock_patient
    
    from controllers.profile_completion_controller import _check_missing_fields
    result = _check_missing_fields(1)
    assert result is False


# Test: Patient with empty string fields (should be treated as missing)
@patch("controllers.profile_completion_controller.PatientRepository")
def test_check_missing_fields_empty_strings(mock_repo):
    mock_patient = MagicMock()
    mock_patient.dob = "1990-01-01"
    mock_patient.gender = "Male"
    mock_patient.address = ""  # Empty string = missing
    mock_patient.emergency_contact = "9876543210"
    mock_patient.medical_history = "None"
    mock_repo.return_value.get_patient_by_id.return_value = mock_patient
    
    from controllers.profile_completion_controller import _check_missing_fields
    result = _check_missing_fields(1)
    assert result is True


# Test: Patient not found
@patch("controllers.profile_completion_controller.PatientRepository")
def test_check_missing_fields_patient_not_found(mock_repo):
    mock_repo.return_value.get_patient_by_id.return_value = None
    
    from controllers.profile_completion_controller import _check_missing_fields
    result = _check_missing_fields(1)
    assert result is None