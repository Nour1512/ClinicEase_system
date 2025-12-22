# tests/test_singleton.py
from core.db_singleton import DatabaseConnection

def test_database_singleton():
    db1 = DatabaseConnection()
    db2 = DatabaseConnection()
    assert db1 is db2  # Same instance