# tests/conftest.py
import pytest
import sys
import os

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app  # Adjust if you use app factory

@pytest.fixture
def client():
    app.config['TESTING'] = True
    return app.test_client()