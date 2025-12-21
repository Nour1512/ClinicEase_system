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








#_________________________________________________________________________________________
# MOHAMED KHALED -> da connection el database 

import pyodbc

class DatabaseConnection:
    _instance = None
    _connection = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, 'initialized'): 
            self.connection_string = (
                "DRIVER={ODBC Driver 17 for SQL Server};"
                "SERVER=NOURALKHAMISSI\\SQLEXPRESS;"
                "DATABASE=soha_swe;"
                "Trusted_Connection=yes;"
            )
            self.initialized = True

    def get_connection(self):
        
        try:
            conn = pyodbc.connect(self.connection_string)
            print("✅ Successfully connected to SQL Server")
            return conn
        except pyodbc.Error as e:
            error_msg = f"Error connecting to SQL Server: {e}"
            print(error_msg)
            raise ConnectionError(f"Database connection failed: {e}") from e
        except Exception as e:
            print(f"Unexpected error connecting to SQL Server: {e}")
            raise

    def close_connection(self):
        
        if self._connection:
            self._connection.close()
            self._connection = None
            print("Closed database connection")

#_________________________________________________________________________________________