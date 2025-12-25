# tests/test_dashboard_controller.py
from unittest.mock import patch, MagicMock
from datetime import datetime

# Test the /dashboard route
@patch("controllers.dashboard_controller.dashboard_repo")
def test_dashboard_page_logged_in(mock_repo, client):
    # Mock session
    with client.session_transaction() as session:
        session["user_id"] = 1
        session["role"] = "doctor"
        session["name"] = "Dr. Smith"

    # Mock repo methods
    mock_stats = MagicMock(
        total_patients=10,
        total_doctors=5,
        total_appointments=20,
        total_revenue=5000,
        pending_appointments=3,
        today_appointments=2,
        available_doctors=4,
        low_stock_medicines=1
    )
    mock_repo.get_dashboard_stats.return_value = mock_stats
    mock_repo.get_recent_activities.return_value = []
    mock_repo.get_upcoming_appointments.return_value = []
    mock_repo.get_doctor_specialty_distribution.return_value = [{"specialty":"Cardiology","count":2}]
    mock_repo.get_revenue_by_month.return_value = [{"month":"Jan","revenue":1000}]

    response = client.get("/dashboard")
    assert response.status_code == 200
    assert b"Dr. Smith" in response.data
    assert b"Doctor" in response.data


@patch("controllers.dashboard_controller.dashboard_repo")
def test_dashboard_page_not_logged_in(mock_repo, client):
    response = client.get("/dashboard", follow_redirects=False)
    assert response.status_code == 302
    assert "/login" in response.headers["Location"]


@patch("controllers.dashboard_controller.dashboard_repo")
def test_get_dashboard_stats_api(mock_repo, client):
    with client.session_transaction() as session:
        session["user_id"] = 1
        session["role"] = "patient"

    mock_stats = MagicMock(
        total_patients=10,
        total_doctors=3,
        total_appointments=15,
        total_revenue=2000,
        pending_appointments=1,
        today_appointments=2,
        available_doctors=2,
        low_stock_medicines=0
    )
    mock_repo.get_dashboard_stats.return_value = mock_stats

    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.get_json()
    assert data["total_patients"] == 10
    assert data["total_revenue"] == 2000


@patch("controllers.dashboard_controller.dashboard_repo")
def test_get_recent_activities_api(mock_repo, client):
    with client.session_transaction() as session:
        session["user_id"] = 1

    mock_activity = MagicMock(
        activity_id=1,
        user_type="doctor",
        user_name="Dr. Smith",
        action="Created appointment",
        timestamp=datetime(2025, 12, 25, 14, 30),
        icon="fa-calendar"
    )
    mock_repo.get_recent_activities.return_value = [mock_activity]

    response = client.get("/api/dashboard/activities")
    assert response.status_code == 200
    data = response.get_json()
    assert data[0]["user_name"] == "Dr. Smith"
    assert data[0]["action"] == "Created appointment"


@patch("controllers.dashboard_controller.dashboard_repo")
def test_get_upcoming_appointments_api(mock_repo, client):
    with client.session_transaction() as session:
        session["user_id"] = 1
        session["role"] = "patient"

    mock_appointment = MagicMock(
        appointment_id=1,
        patient_name="John Doe",
        doctor_name="Dr. Smith",
        appointment_date=datetime(2025, 12, 30),
        time_slot="10:00 AM",
        status="Scheduled"
    )
    mock_repo.get_upcoming_appointments.return_value = [mock_appointment]

    response = client.get("/api/dashboard/appointments")
    assert response.status_code == 200
    data = response.get_json()
    assert data[0]["patient_name"] == "John Doe"
    assert data[0]["status"] == "Scheduled"


def test_dashboard_to_doctors_redirect(client):
    response = client.get("/to_doctors", follow_redirects=False)
    assert response.status_code == 302
    assert "/doctors" in response.headers["Location"]