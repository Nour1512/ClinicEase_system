import pytest
from unittest.mock import patch, MagicMock
from repositories.pharmacy_repository import PharmacyRepository
from models.Pharmacy import Pharmacy

# -------------------------------
# Helper functions
# -------------------------------
def fake_pharmacy_row():
    return (
        1,                      # Medicine_ID
        "Paracetamol",          # Medicine_Name
        100,                    # Quantity
        10.5,                   # price
        "2026-01-01",           # Expiry_Date
        "PharmaSupplier"        # Supplier
    )

def fake_pharmacy_columns():
    return [
        ("Medicine_ID",),
        ("Medicine_Name",),
        ("Quantity",),
        ("price",),
        ("Expiry_Date",),
        ("Supplier",)
    ]

def fake_pharmacy_object():
    return Pharmacy(
        Medicine_id=1,
        MedicineName="Paracetamol",
        Quantity=100,
        price=10.5,
        ExpiryDate="2026-01-01",
        supplier="PharmaSupplier"
    )

# -------------------------------
# Test get_medicine_by_ID (found)
# -------------------------------
@patch("repositories.pharmacy_repository.DatabaseConnection")
def test_get_medicine_by_id_found(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = fake_pharmacy_row()
    mock_cursor.description = fake_pharmacy_columns()

    repo = PharmacyRepository()
    medicine = repo.get_medicine_by_ID(1)

    assert medicine is not None
    assert medicine.MedicineName == "Paracetamol"

# -------------------------------
# Test get_medicine_by_ID (not found)
# -------------------------------
@patch("repositories.pharmacy_repository.DatabaseConnection")
def test_get_medicine_by_id_not_found(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = None
    mock_cursor.description = fake_pharmacy_columns()

    repo = PharmacyRepository()
    medicine = repo.get_medicine_by_ID(999)

    assert medicine is None

# -------------------------------
# Test create_medicine
# -------------------------------
@patch("repositories.pharmacy_repository.DatabaseConnection")
def test_create_medicine(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = PharmacyRepository()
    medicine = fake_pharmacy_object()

    repo.create_medicine(medicine)

    mock_cursor.execute.assert_called_once()
    mock_conn.commit.assert_called_once()

# -------------------------------
# Test delete_medicine
# -------------------------------
@patch("repositories.pharmacy_repository.DatabaseConnection")
def test_delete_medicine(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = PharmacyRepository()
    repo.delete_medicine(1)

    mock_cursor.execute.assert_called_once_with(
        "DELETE FROM pharmacy WHERE Medicine_ID = ?",
        (1,)
    )
    mock_conn.commit.assert_called_once()

# -------------------------------
# Test get_all_medicines
# -------------------------------
@patch("repositories.pharmacy_repository.DatabaseConnection")
def test_get_all_medicines(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchall.return_value = [
        fake_pharmacy_row(),
        fake_pharmacy_row()
    ]
    mock_cursor.description = fake_pharmacy_columns()

    repo = PharmacyRepository()
    medicines = repo.get_all_medicines()

    assert len(medicines) == 2
    assert all(isinstance(m, Pharmacy) for m in medicines)

# -------------------------------
# Test update_medicine_quantity
# -------------------------------
@patch("repositories.pharmacy_repository.DatabaseConnection")
def test_update_medicine_quantity(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = PharmacyRepository()
    repo.update_medicine_quantity(1, 250)

    mock_cursor.execute.assert_called_once_with(
        "UPDATE pharmacy SET Quantity = ? WHERE Medicine_ID = ?",
        (250, 1)
    )
    mock_conn.commit.assert_called_once()