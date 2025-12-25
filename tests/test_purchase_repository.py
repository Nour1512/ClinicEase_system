import pytest
from unittest.mock import patch, MagicMock
from repositories.purchase_repository import PurchaseRepository

# -------------------------------
# Helper data
# -------------------------------

def fake_purchase_row():
    return (
        1,          # purchase_id
        10,         # patient_id
        250.0,      # total_amount
        "Pending"   # status
    )

def fake_purchase_columns():
    return [
        ("purchase_id",),
        ("patient_id",),
        ("total_amount",),
        ("status",)
    ]

# -------------------------------
# Test create_purchase
# -------------------------------
@patch("repositories.purchase_repository.DatabaseConnection")
def test_create_purchase(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # Simulate returning generated purchase ID
    mock_cursor.fetchone.return_value = (1,)

    repo = PurchaseRepository()
    purchase_id = repo.create_purchase(10, 250.0)

    assert purchase_id == 1
    mock_cursor.execute.assert_called_once()
    mock_conn.commit.assert_called_once()
    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()

# -------------------------------
# Test get_purchase_by_id (found)
# -------------------------------
@patch("repositories.purchase_repository.DatabaseConnection")
def test_get_purchase_by_id_found(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = fake_purchase_row()
    mock_cursor.description = fake_purchase_columns()

    repo = PurchaseRepository()
    purchase = repo.get_purchase_by_id(1)

    assert purchase is not None
    assert purchase["purchase_id"] == 1
    assert purchase["status"] == "Pending"

# -------------------------------
# Test get_purchase_by_id (not found)
# -------------------------------
@patch("repositories.purchase_repository.DatabaseConnection")
def test_get_purchase_by_id_not_found(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = None

    repo = PurchaseRepository()
    purchase = repo.get_purchase_by_id(999)

    assert purchase is None

# -------------------------------
# Test update_purchase_status
# -------------------------------
@patch("repositories.purchase_repository.DatabaseConnection")
def test_update_purchase_status(mock_db):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db.return_value.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    repo = PurchaseRepository()
    repo.update_purchase_status(1, "Completed")

    mock_cursor.execute.assert_called_once_with(
        "UPDATE purchase SET status = ? WHERE purchase_id = ?",
        ("Completed", 1)
    )
    mock_conn.commit.assert_called_once()
    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()