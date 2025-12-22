# tests/test_pharmacy_controller.py
from unittest.mock import patch, MagicMock

@patch("controllers.pharamcy_controler.pharmacy_repo")
def test_pharmacy_home(mock_repo, client):
    mock_repo.get_all_medicines.return_value = []
    response = client.get("/pharmacy")
    assert response.status_code == 200
    assert b"Medicine Grid" in response.data

@patch("controllers.pharamcy_controler.pharmacy_repo")
def test_api_get_medicines(mock_repo, client):
    mock_repo.get_all_medicines.return_value = [
        MagicMock(Medicine_id=1, MedicineName="Paracetamol", Quantity=10, price=2.99, ExpiryDate="2025-12-31", supplier="MediCo")
    ]
    response = client.get("/pharmacy/api/medicines")
    assert response.status_code == 200
    assert b"Paracetamol" in response.data