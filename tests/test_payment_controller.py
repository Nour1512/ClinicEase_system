# # tests/test_payment_controller.py
# from unittest.mock import patch

# @patch("controllers.payment_controllers.purchase_repo")
# @patch("controllers.payment_controllers.payment_repo")
# def test_create_payment_success(mock_payment_repo, mock_purchase_repo, client):
#     # Mock session
#     with client.session_transaction() as sess:
#         sess["user_id"] = 1
    
#     mock_purchase_repo.get_purchase_by_id.return_value = {"patient_id": 1, "total_amount": 50.0}
#     mock_payment_repo.create_payment.return_value = 101

#     response = client.post("/payments/create", data={
#         "purchase_id": "1",
#         "amount": "50.0",
#         "card_number": "4111111111111111",
#         "cardholder_name": "John Doe",
#         "expiry_date": "12/25",
#         "cvv": "123"
#     })
    
#     assert response.status_code == 200
#     assert b"Payment processed successfully" in response.data









# from unittest.mock import patch

# @patch("controllers.payment_controllers.purchase_repo")
# @patch("controllers.payment_controllers.payment_repo")
# def test_create_payment_success(mock_payment_repo, mock_purchase_repo, client):
#     # Mock session
#     with client.session_transaction() as sess:
#         sess["user_id"] = 1
    
#     mock_purchase_repo.get_purchase_by_id.return_value = {"patient_id": 1, "total_amount": 50.0}
#     mock_payment_repo.create_payment.return_value = 101

#     response = client.post("/payments/create", data={
#         "purchase_id": "1",
#         "amount": "50.0",
#         "card_number": "4111111111111111",
#         "cardholder_name": "John Doe",
#         "expiry_date": "12/25",
#         "cvv": "123"
#     })
    
#     # ✅ Check for HTML response instead of JSON
#     assert response.status_code == 200
#     assert b"Your payment is recorded" in response.data  # Matches your HTML template
#     assert b"confirmation" in response.data  # Check it's the confirmation page






from unittest.mock import patch
import json

@patch("controllers.payment_controllers.purchase_repo")
@patch("controllers.payment_controllers.payment_repo")
def test_create_payment_success(mock_payment_repo, mock_purchase_repo, client):
    # Mock session
    with client.session_transaction() as sess:
        sess["user_id"] = 1
    
    mock_purchase_repo.get_purchase_by_id.return_value = {"patient_id": 1, "total_amount": 50.0}
    mock_payment_repo.create_payment.return_value = 101

    response = client.post("/payments/create", data={
        "purchase_id": "1",
        "amount": "50.0",
        "card_number": "4111111111111111",
        "cardholder_name": "John Doe",
        "expiry_date": "12/25",
        "cvv": "123"
    })
    
    # ✅ Check JSON response instead of HTML
    assert response.status_code == 200
    
    # Parse JSON response
    data = json.loads(response.data)
    assert data["success"] == True
    assert data["message"] == "Payment processed successfully!"
    assert data["payment_id"] == 101
    assert data["redirect_url"] == "/after-payment-page"