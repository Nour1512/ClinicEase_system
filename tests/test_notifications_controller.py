# tests/test_notifications_controller.py
from unittest.mock import patch, MagicMock

# Test notifications page
@patch("controllers.notifications_controller.repo")
def test_notifications_page_logged_in(mock_repo, client):
    # Mock session
    with client.session_transaction() as session:
        session["user_id"] = 1
        session["role"] = "patient"
        session["name"] = "Farah"

    # Mock repository methods
    mock_repo.get_notifications.return_value = [
        MagicMock(id=1, message="Test Notification", read=False)
    ]
    mock_repo.count_unread.return_value = 1

    response = client.get("/notifications")
    assert response.status_code == 200
    assert b"Test Notification" in response.data
    assert b"Farah" in response.data


@patch("controllers.notifications_controller.repo")
def test_notifications_page_not_logged_in(mock_repo, client):
    response = client.get("/notifications")
    assert response.status_code == 403
    assert b"Access Denied" in response.data  # Assuming your 403 template has 'Access Denied' text


@patch("controllers.notifications_controller.repo")
def test_mark_read(mock_repo, client):
    response = client.post("/api/mark-read/1")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    mock_repo.mark_as_read.assert_called_once_with(1)


@patch("controllers.notifications_controller.repo")
def test_mark_all_read(mock_repo, client):
    with client.session_transaction() as session:
        session["user_id"] = 1
        session["role"] = "patient"

    response = client.post("/api/mark-all-read")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    mock_repo.mark_all_as_read.assert_called_once_with(1, "patient")


@patch("controllers.notifications_controller.repo")
def test_unread_count(mock_repo, client):
    with client.session_transaction() as session:
        session["user_id"] = 1
        session["role"] = "patient"

    mock_repo.count_unread.return_value = 5
    response = client.get("/api/count")
    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 5