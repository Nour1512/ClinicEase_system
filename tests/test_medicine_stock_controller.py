# tests/test_medicine_stock_controller.py
from unittest.mock import patch, MagicMock
import json

# Test GET /medicine-stock/
def test_medicine_stock_page(client):
    response = client.get("/medicine-stock/")
    assert response.status_code == 200
    assert b"Medicine" in response.data or b"medicine" in response.data


# Test GET /api/medicines
@patch("controllers.ms_controller.repo")
def test_get_all_medicines(mock_repo, client):
    mock_repo.get_all.return_value = [{"id": 1, "name": "Paracetamol"}]

    response = client.get("/medicine-stock/api/medicines")
    assert response.status_code == 200
    data = response.get_json()
    assert data == [{"id": 1, "name": "Paracetamol"}]


# Test GET /api/medicines/search
@patch("controllers.ms_controller.repo")
def test_search_medicines(mock_repo, client):
    mock_repo.search.return_value = [{"id": 1, "name": "Paracetamol"}]

    response = client.get("/medicine-stock/api/medicines/search?q=Para")
    assert response.status_code == 200
    data = response.get_json()
    assert data == [{"id": 1, "name": "Paracetamol"}]
    mock_repo.search.assert_called_once_with("Para")


# Test POST /api/medicines (success)
@patch("controllers.ms_controller.repo")
def test_add_medicine_success(mock_repo, client):
    mock_medicine = MagicMock()
    mock_medicine.to_dict.return_value = {"id": 1, "name": "Paracetamol"}
    mock_repo.create.return_value = mock_medicine

    response = client.post("/medicine-stock/api/medicines", json={"name": "Paracetamol"})
    assert response.status_code == 201
    data = response.get_json()
    assert data == {"id": 1, "name": "Paracetamol"}


# Test POST /api/medicines (no data)
def test_add_medicine_no_data(client):
    response = client.post("/medicine-stock/api/medicines", json={})
    assert response.status_code == 400
    assert "No data provided" in response.get_json()["error"]


# Test PUT /api/medicines/<id> success
@patch("controllers.ms_controller.repo")
def test_update_medicine_success(mock_repo, client):
    mock_medicine = MagicMock()
    mock_medicine.to_dict.return_value = {"id": 1, "name": "Ibuprofen"}
    mock_repo.update.return_value = mock_medicine

    response = client.put("/medicine-stock/api/medicines/1", json={"name": "Ibuprofen"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["name"] == "Ibuprofen"


# Test PUT /api/medicines/<id> not found
@patch("controllers.ms_controller.repo")
def test_update_medicine_not_found(mock_repo, client):
    mock_repo.update.return_value = None
    response = client.put("/medicine-stock/api/medicines/999", json={"name": "Ibuprofen"})
    assert response.status_code == 404
    assert "Medicine not found" in response.get_json()["error"]


# Test DELETE /api/medicines/<id> success
@patch("controllers.ms_controller.repo")
def test_delete_medicine_success(mock_repo, client):
    mock_repo.delete.return_value = True
    response = client.delete("/medicine-stock/api/medicines/1")
    assert response.status_code == 200
    assert "Medicine deleted successfully" in response.get_json()["message"]


# Test DELETE /api/medicines/<id> not found
@patch("controllers.ms_controller.repo")
def test_delete_medicine_not_found(mock_repo, client):
    mock_repo.delete.return_value = False
    response = client.delete("/medicine-stock/api/medicines/999")
    assert response.status_code == 404
    assert "Medicine not found" in response.get_json()["error"]


# Test /ping endpoint
def test_ping(client):
    response = client.get("/medicine-stock/ping")
    assert response.status_code == 200
    data = response.get_json()
    assert data["ping"] == "backend is alive"