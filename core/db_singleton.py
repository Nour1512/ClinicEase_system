# import sqlite3

# class DatabaseConnection:
#     _instance = None
#     _connection = None
#     def __new__(cls):
#         if cls._instance is None:
#             cls._instance = super(DatabaseConnection, cls).__new__(cls)
#         return cls._instance
#     def __init__(self):
#         if not hasattr(self, "connection") or self.connection is None:
#             try:
#                 # self.connection = mysql.connector.connect(
#                 #     host="localhost",
#                 #     user="root",
#                 #     # password="", # Change if you set a password
#                 #     database="Clinic_Ease"
#                 # )
#                 # print(" Connected to MySQL")
#                 self._connection = sqlite3.connect("clinic_ease.db")
#                 print("Connected to SQLite")
#             except Exception as e:
#                 print(" ERROR connecting to SQLite:", e)
#                 self._connection = None

#     def get_connection(self):
#         return self._connection









# db_singleton.py
import pyodbc

class DatabaseConnection:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # Ensure __init__ runs only once
        if not hasattr(self, 'initialized'):
            # 🔧 Configure your SQL Server connection string
            self.connection_string = (
                "DRIVER={ODBC Driver 17 for SQL Server};"  # or "ODBC Driver 18 for SQL Server"
                "SERVER=localhost\\SQLEXPRESS;"                        # Use your server (e.g., localhost, .\\SQLEXPRESS)
                "DATABASE=Clinic_Ease;"
                "Trusted_Connection=yes;"                  # Windows Authentication (no password)
                # 🔐 For SQL Server Authentication (username/password), use:
                # "UID=sa;PWD=YourStrongPassword123;"
            )
            self.initialized = True

    def get_connection(self):
        """
        Returns a NEW connection to SQL Server.
        ⚠️ Always close this connection after use (use try/finally or context manager).
        """
        try:
            conn = pyodbc.connect(self.connection_string)
            return conn
        except Exception as e:
            print("❌ ERROR connecting to SQL Server:", e)
            raise