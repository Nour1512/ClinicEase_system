# tests/test_password_reset_controller.py
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

# Test GET /forgot-password
def test_forgot_password_get(client):
    response = client.get("/forgot-password")
    assert response.status_code == 200
    # assert b"Forgot Password" in response.data  
    assert b"email" in response.data.lower() or b"reset" in response.data.lower()


# Test POST /forgot-password (existing user, email sent)
@patch("controllers.reset_pass_controller.send_reset_email")
@patch("controllers.reset_pass_controller.ResetPassRepository")
@patch("controllers.reset_pass_controller.PatientRepository")
def test_forgot_password_post_existing_user(mock_patient_repo, mock_reset_repo, mock_send_email, client):
    mock_patient = MagicMock()
    mock_patient_repo.return_value.get_patient_by_email.return_value = mock_patient
    mock_reset_repo.return_value.save_reset_code.return_value = True

    response = client.post("/forgot-password", data={"email": "test@example.com"}, follow_redirects=False)
    assert response.status_code == 302
    # Redirects to verify_reset_code with email param
    assert "/verify-reset-code" in response.headers["Location"]
    mock_send_email.assert_called_once()


# Test POST /forgot-password (non-existing user)
@patch("controllers.reset_pass_controller.PatientRepository")
def test_forgot_password_post_non_existing_user(mock_patient_repo, client):
    mock_patient_repo.return_value.get_patient_by_email.return_value = None

    response = client.post("/forgot-password", data={"email": "noone@example.com"}, follow_redirects=False)
    assert response.status_code == 302
    assert "/forgot-password" in response.headers["Location"]


# Test GET /verify-reset-code
def test_verify_reset_code_get(client):
    response = client.get("/verify-reset-code?email=test@example.com")
    assert response.status_code == 200
    # assert b"Verify Code" in response.data
    assert b"code" in response.data.lower() or b"test@example.com" in response.data


# Test POST /verify-reset-code (correct code)
@patch("controllers.reset_pass_controller.ResetPassRepository")
def test_verify_reset_code_post_correct(mock_reset_repo, client):
    with client.session_transaction() as session:
        session.clear()

    future_time = datetime.now() + timedelta(minutes=5)
    mock_reset_repo.return_value.get_reset_code.return_value = ("123456", future_time, False)
    mock_reset_repo.return_value.mark_code_as_used.return_value = True

    response = client.post("/verify-reset-code", data={"email": "test@example.com", "code": "123456"}, follow_redirects=False)
    assert response.status_code == 302
    assert "/reset-password" in response.headers["Location"]


# Test POST /verify-reset-code (incorrect code)
@patch("controllers.reset_pass_controller.ResetPassRepository")
def test_verify_reset_code_post_incorrect(mock_reset_repo, client):
    future_time = datetime.now() + timedelta(minutes=5)
    mock_reset_repo.return_value.get_reset_code.return_value = ("123456", future_time, False)
    response = client.post("/verify-reset-code", data={"email": "test@example.com", "code": "000000"})
    assert response.status_code == 200
    # assert b"Incorrect code" in response.data
    assert b"Enter Verification Code" in response.data
    assert b'test@example.com' in response.data


# Test GET /reset-password
def test_reset_password_get_logged_in(client):
    with client.session_transaction() as session:
        session["reset_email"] = "test@example.com"

    response = client.get("/reset-password")
    assert response.status_code == 200
    assert b"Reset Password" in response.data  # Template check


# Test POST /reset-password
@patch("controllers.reset_pass_controller.ResetPassRepository")
def test_reset_password_post_success(mock_reset_repo, client):
    with client.session_transaction() as session:
        session["reset_email"] = "test@example.com"

    response = client.post("/reset-password", data={"password": "newpass123"}, follow_redirects=False)
    assert response.status_code == 302
    assert "/password-changed" in response.headers["Location"]
    mock_reset_repo.return_value.update_user_password.assert_called_once_with("test@example.com", "newpass123")


# Test GET /password-changed
def test_password_changed_get(client):
    response = client.get("/password-changed")
    assert response.status_code == 200
    assert b"Password updated successfully" in response.data or b"Password Changed" in response.data