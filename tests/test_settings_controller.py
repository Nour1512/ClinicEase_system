# tests/test_settings_controller.py
from unittest.mock import patch

@patch("controllers.settings_controler.settings_repo")
def test_settings_home(mock_repo, client):
    with client.session_transaction() as sess:
        sess["user_id"] = 1
    
    mock_repo.get_by_id.return_value = {"theme": "light", "language": "en"}
    response = client.get("/settings")
    assert response.status_code == 200
    assert b"Settings" in response.data

@patch("controllers.settings_controler.settings_repo")
def test_change_password_api(mock_repo, client):
    response = client.post("/settings/api/change_password", json={
        "user_id": 1,
        "new_password": "newpass123"
    })
    assert response.status_code == 200
    assert b"Password changed successfully" in response.data