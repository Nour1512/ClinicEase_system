import pytest
from flask import Flask
from unittest.mock import MagicMock

# Import the blueprint and repo instance
from controllers.invoice_details_controller import invoice_bp, repo


@pytest.fixture
def app():
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.register_blueprint(invoice_bp)
    return app


@pytest.fixture
def client(app):
    return app.test_client()


# ===========================
# TEST: /invoice-page
# ===========================

def test_list_invoices_success(client, monkeypatch):
    """Should return invoice page when invoices exist"""

    fake_invoice = {
        "id": 1,
        "total": 250,
        "status": "Paid"
    }

    monkeypatch.setattr(
        repo,
        "get_all_invoices",
        MagicMock(return_value=[fake_invoice])
    )

    response = client.get("/invoice-page")

    assert response.status_code == 200
    assert b"invoice" in response.data or b"Invoice" in response.data


def test_list_invoices_empty(client, monkeypatch):
    """Should show message when no invoices exist"""

    monkeypatch.setattr(
        repo,
        "get_all_invoices",
        MagicMock(return_value=[])
    )

    response = client.get("/invoice-page")

    assert response.status_code == 200
    assert b"No invoices found" in response.data


def test_list_invoices_exception(client, monkeypatch):
    """Should return 500 when repository throws error"""

    monkeypatch.setattr(
        repo,
        "get_all_invoices",
        MagicMock(side_effect=Exception("DB Error"))
    )

    response = client.get("/invoice-page")

    assert response.status_code == 500
    assert b"Error" in response.data


# ===========================
# TEST: /invoice/details/<id>
# ===========================

def test_invoice_details_success(client, monkeypatch):
    """Should return invoice details page"""

    fake_invoice = {
        "id": 5,
        "total": 300,
        "status": "Pending"
    }

    monkeypatch.setattr(
        repo,
        "get_invoice_by_id",
        MagicMock(return_value=fake_invoice)
    )

    response = client.get("/invoice/details/5")

    assert response.status_code == 200
    assert b"invoice" in response.data or b"Invoice" in response.data


def test_invoice_details_not_found(client, monkeypatch):
    """Should return 404 if invoice not found"""

    monkeypatch.setattr(
        repo,
        "get_invoice_by_id",
        MagicMock(return_value=None)
    )

    response = client.get("/invoice/details/99")

    assert response.status_code == 404


def test_invoice_details_exception(client, monkeypatch):
    """Should return 500 on repository failure"""

    monkeypatch.setattr(
        repo,
        "get_invoice_by_id",
        MagicMock(side_effect=Exception("DB failure"))
    )

    response = client.get("/invoice/details/1")

    assert response.status_code == 500
    assert b"Error" in response.data
