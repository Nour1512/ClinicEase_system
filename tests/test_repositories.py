from unittest.mock import patch, MagicMock
from repositories.patient_repository import PatientRepository

@patch("repositories.patient_repository.DatabaseConnection")
def test_get_patient_by_email(mock_db_class):
    # Mock the INSTANCE returned by DatabaseConnection()
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    
    # Configure the mock chain
    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor
    
    # Mock the database response
    mock_cursor.fetchone.return_value = (
        1, "John Doe", "j@test.com", "Asthma", "123 Main St",
        "1990-01-01", "Male", "Jane Doe (555-1234)", "password123"
    )
    mock_cursor.description = [
        ('patient_id',), ('full_name',), ('email',), ('medical_history',),
        ('address',), ('dob',), ('gender',), ('emergency_contact',), ('password',)
    ]

    repo = PatientRepository()
    patient = repo.get_patient_by_email("j@test.com")
    
    assert patient is not None
    assert patient.full_name == "John Doe"