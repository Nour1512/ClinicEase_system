# tests/test_payment_repository.py
from unittest.mock import patch, MagicMock, ANY
from repositories.payment_repository import PaymentRepository

@patch("repositories.payment_repository.DatabaseConnection")
def test_create_payment(mock_db_class):
    # Mock DB objects
    mock_db_instance = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_db_class.return_value = mock_db_instance
    mock_db_instance.get_connection.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # Mock SCOPE_IDENTITY() result
    mock_cursor.fetchone.return_value = (123,)

    repo = PaymentRepository()
    payment_data = {
        'purchase_id': 10,
        'amount': 250.0,
        'payment_method': 'Credit Card',
        'status': 'Success'
    }

    payment_id = repo.create_payment(payment_data)

    # Assertions
    assert payment_id == 123
    mock_cursor.execute.assert_any_call(
        """
                INSERT INTO payment (purchase_id, Amount, Payment_Method, Payment_Date, Status)
                VALUES (?, ?, ?, ?, ?)
            """,
        (
            payment_data['purchase_id'],
            payment_data['amount'],
            payment_data['payment_method'],
            ANY,  # Use ANY because Payment_Date is dynamic
            payment_data['status']
        )
    )
    mock_cursor.execute.assert_any_call("SELECT SCOPE_IDENTITY()")
    mock_conn.commit.assert_called_once()
    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()
