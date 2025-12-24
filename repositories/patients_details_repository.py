from core.db_singleton import DatabaseConnection
from models.patient_details import patient_details

class patient_details_repository:

    def get_patient_detail_by_id(self, patient_id):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute(
                "SELECT * FROM patients_details WHERE patient_id = ?",
                (patient_id,)
            )
            row = cursor.fetchone()
            if row:
                columns = [col[0] for col in cursor.description]
                row_dict = dict(zip(columns, row))
                return patient_details.from_dict(row_dict)
            return None
        finally:
            cursor.close()
            db.close()

    def update_patient_details(self, patient: patient_details):
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("""
                UPDATE patients_details
                SET blood_type = ?, height_cm = ?, weight_kg = ?,
                    medical_record = ?, current_medications = ?,
                    medical_notes = ?, emergency_contact_name = ?,
                    emergency_contact_phone = ?
                WHERE patient_id = ?
            """, (
                patient.blood_type,
                patient.height_cm,
                patient.weight_kg,
                patient.medical_record,
                patient.current_medications,
                patient.medical_notes,
                patient.emergency_contact_name,
                patient.emergency_contact_phone,
                patient.patient_id
            ))
            db.commit()
        finally:
            cursor.close()
            db.close()
# def add_patient_details(self, patient: patient_details):
#     db = DatabaseConnection().get_connection()
#     try:
#         cursor = db.cursor()
#         cursor.execute("""
#             INSERT INTO patients_details (
#                 patient_id,
#                 blood_type,
#                 height_cm,
#                 weight_kg,
#                 medical_record,
#                 current_medications,
#                 medical_notes,
#                 emergency_contact_name,
#                 emergency_contact_phone
#             )
#             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             patient.patient_id,
#             patient.blood_type,
#             patient.height_cm,
#             patient.weight_kg,
#             patient.medical_record,
#             patient.current_medications,
#             patient.medical_notes,
#             patient.emergency_contact_name,
#             patient.emergency_contact_phone
#         ))
#         db.commit()
#     finally:
#         cursor.close()
#         db.close()