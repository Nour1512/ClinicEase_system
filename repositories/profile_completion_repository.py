from core.db_singleton import DatabaseConnection

class ProfileCompletionRepository:
    def get_missing_fields(self, patient_id):
        """Returns list of missing required fields for patient"""
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            cursor.execute("""
                SELECT 
                    CASE WHEN full_name IS NULL OR full_name = '' THEN 'full_name' ELSE NULL END,
                    CASE WHEN email IS NULL OR email = '' THEN 'email' ELSE NULL END,
                    CASE WHEN dob IS NULL THEN 'dob' ELSE NULL END,
                    CASE WHEN gender IS NULL OR gender = '' THEN 'gender' ELSE NULL END,
                    CASE WHEN address IS NULL OR address = '' THEN 'address' ELSE NULL END,
                    CASE WHEN emergency_contact IS NULL OR emergency_contact = '' THEN 'emergency_contact' ELSE NULL END,
                    CASE WHEN medical_history IS NULL THEN 'medical_history' ELSE NULL END,
                FROM Patients 
                WHERE patient_id = ?
            """, (patient_id,))
            
            row = cursor.fetchone()
            if not row:
                return []
            
            # Filter out None values (completed fields)
            all_fields = [
                'full_name', 'email', 'date_of_birth', 'gender',
                'address', 'emergency_contact', 'medical_history', 'phone'
            ]
            missing = [field for field, value in zip(all_fields, row) if value is not None]
            
            # Remove fields that should always exist (email/full_name from signup)
            return [f for f in missing if f not in ['full_name', 'email']]
            
        finally:
            cursor.close()
            db.close()

    def update_patient_fields(self, patient_id, field_data):
        """Update only the submitted fields"""
        if not field_data:
            return
        
        db = DatabaseConnection().get_connection()
        try:
            cursor = db.cursor()
            
            # Build dynamic SET clause
            set_clause = ", ".join([f"{field} = ?" for field in field_data.keys()])
            values = list(field_data.values()) + [patient_id]
            
            cursor.execute(f"""
                UPDATE Patients 
                SET {set_clause} 
                WHERE patient_id = ?
            """, values)
            db.commit()
            
        finally:
            cursor.close()
            db.close()