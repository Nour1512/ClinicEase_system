# tests/test_patient_details_repository.py
from unittest.mock import patch, MagicMock
from repositories.patients_details_repository import patient_details_repository
from models.patient_details import patient_details

# --------------------------
# Test get_patient_detail_by_id
# --------------------------
@patch("repositories.patients_details_repository.DatabaseConnection")
def test_get_patient_detail_by_id(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = (
        1, "O+", 180, 75, "Record A", "Medication A", "Notes A", "Contact A", "1234567890"
    )
    mock_cursor.description = [
        ("patient_id",), ("blood_type",), ("height_cm",), ("weight_kg",),
        ("medical_record",), ("current_medications",), ("medical_notes",),
        ("emergency_contact_name",), ("emergency_contact_phone",)
    ]

    repo = patient_details_repository()
    patient_obj = repo.get_patient_detail_by_id(1)

    assert patient_obj.patient_id == 1
    assert patient_obj.blood_type == "O+"
    assert patient_obj.height_cm == 180
    assert patient_obj.weight_kg == 75
    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()

# --------------------------
# Test update_patient_details
# --------------------------
@patch("repositories.patients_details_repository.DatabaseConnection")
def test_update_patient_details(mock_db_class):
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    patient_obj = patient_details(
        patient_id=1,
        blood_type="A+",
        height_cm=170,
        weight_kg=70,
        medical_record="Record B",
        current_medications="Medication B",
        medical_notes="Notes B",
        emergency_contact_name="Contact B",
        emergency_contact_phone="9876543210"
    )

    repo = patient_details_repository()
    repo.update_patient_details(patient_obj)

    mock_cursor.execute.assert_called_once()
    mock_conn.commit.assert_called_once()
    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()

# --------------------------
# Test add_patient_details
# --------------------------
# @patch("repositories.patients_details_repository.DatabaseConnection")
# def test_add_patient_details(mock_db_class):
#     mock_db_instance = MagicMock()
#     mock_conn = MagicMock()
#     mock_cursor = MagicMock()

#     mock_db_class.return_value = mock_db_instance
#     mock_db_instance.get_connection.return_value = mock_conn
#     mock_conn.cursor.return_value = mock_cursor

#     patient_obj = patient_details(
#         patient_id=2,
#         blood_type="B+",
#         height_cm=165,
#         weight_kg=60,
#         medical_record="Record C",
#         current_medications="Medication C",
#         medical_notes="Notes C",
#         emergency_contact_name="Contact C",
#         emergency_contact_phone="1122334455"
#     )

#     repo = patient_details_repository()
#     repo.add_patient_details(patient_obj)

#     mock_cursor.execute.assert_called_once()
#     mock_conn.commit.assert_called_once()
#     mock_cursor.close.assert_called_once()
#     mock_conn.close.assert_called_once()
