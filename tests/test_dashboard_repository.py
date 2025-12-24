from unittest.mock import patch, MagicMock
from repositories.dashboard_repository import DashboardRepository
from models.dashboard import DashboardStats, RecentActivity, AppointmentSummary
@patch("repositories.dashboard_repository.DatabaseConnection")
def test_get_dashboard_stats(mock_db_class):
    mock_db = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db
    mock_db.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # Each fetchone() corresponds to one stat query (ORDER MATTERS)
    mock_cursor.fetchone.side_effect = [
        (100,),   # total_patients
        (20,),    # total_doctors
        (300,),   # total_appointments
        (50000,), # total_revenue
        (15,),    # pending_appointments
        (5,),     # today_appointments
        (10,),    # available_doctors
        (7,)      # low_stock_medicines
    ]

    repo = DashboardRepository()
    stats = repo.get_dashboard_stats()

    assert isinstance(stats, DashboardStats)
    assert stats.total_patients == 100
    assert stats.total_doctors == 20
    assert stats.total_revenue == 50000.0
@patch("repositories.dashboard_repository.DatabaseConnection")
def test_get_recent_activities(mock_db_class):
    mock_db = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db
    mock_db.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # First fetchall → appointments
    # Second fetchall → prescriptions
    mock_cursor.fetchall.side_effect = [
        [
            (1, "John Doe", "Dr. Smith", "2025-01-01", "Appointment Pending", "2025-01-01")
        ],
        [
            (2, "Jane Doe", "Dr. Adams", "2025-01-02", "Prescription Issued", "2025-01-02")
        ]
    ]

    repo = DashboardRepository()
    activities = repo.get_recent_activities(limit=5)

    assert len(activities) > 0
    assert isinstance(activities[0], RecentActivity)
@patch("repositories.dashboard_repository.DatabaseConnection")
def test_get_upcoming_appointments(mock_db_class):
    mock_db = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db
    mock_db.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchall.return_value = [
        (1, "John Doe", "Dr. Smith", "2025-02-01", "Pending", "10:00 AM")
    ]

    repo = DashboardRepository()
    appointments = repo.get_upcoming_appointments()

    assert len(appointments) == 1
    assert isinstance(appointments[0], AppointmentSummary)
    assert appointments[0].patient_name == "John Doe"
@patch("repositories.dashboard_repository.DatabaseConnection")
def test_get_doctor_specialty_distribution(mock_db_class):
    mock_db = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db
    mock_db.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchall.return_value = [
        ("Cardiology", 5),
        ("Neurology", 3)
    ]

    repo = DashboardRepository()
    result = repo.get_doctor_specialty_distribution()

    assert result == [
        {"specialty": "Cardiology", "count": 5},
        {"specialty": "Neurology", "count": 3}
    ]
@patch("repositories.dashboard_repository.DatabaseConnection")
def test_get_revenue_by_month(mock_db_class):
    mock_db = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db
    mock_db.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchall.return_value = [
        ("2025-01", 10000),
        ("2025-02", 15000)
    ]

    repo = DashboardRepository()
    result = repo.get_revenue_by_month()

    assert result == [
        {"month": "2025-01", "revenue": 10000.0},
        {"month": "2025-02", "revenue": 15000.0}
    ]
