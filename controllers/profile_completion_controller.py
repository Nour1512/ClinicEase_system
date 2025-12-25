# from flask import Blueprint, session
# from repositories.patient_repository import PatientRepository

# profile_completion = Blueprint('profile_completion', __name__)

# def get_missing_profile_fields():
#     """
#     Returns True if patient has missing profile fields, False otherwise.
#     Returns None if not a patient or not logged in.
#     """
#     if session.get("role") != "patient" or "user_id" not in session:
#         return None
    
#     patient_repo = PatientRepository()
#     patient = patient_repo.get_patient_by_id(session["user_id"])
    
#     if not patient:
#         return None
    
#     # Define required fields (excluding email/full_name from signup)
#     required_fields = [
#         'dob', 'gender', 'address', 
#         'emergency_contact', 'medical_history'
#     ]
    
#     # Check if any required field is missing
#     for field in required_fields:
#         if not getattr(patient, field, None):
#             return True
    
#     return False










from flask import session , Blueprint
from repositories.patient_repository import PatientRepository

profile_completion = Blueprint('profile_completion', __name__)

def get_missing_profile_fields():
    """Template context processor - requires request context"""
    if session.get("role") != "patient" or "user_id" not in session:
        return None
    return _check_missing_fields(session["user_id"])

def _check_missing_fields(user_id):
    """Core logic - no session dependency, returns True if fields are missing, False if complete, None if patient not found"""
    try:
        repo = PatientRepository()
        patient = repo.get_patient_by_id(user_id)
        
        if not patient:
            return None
            
        required_fields = ['dob', 'gender', 'address', 'emergency_contact', 'medical_history']
        for field in required_fields:
            value = getattr(patient, field, None)
            if value is None or (isinstance(value, str) and value.strip() == ""):
                return True  # Has missing fields
        
        return False  # All fields complete
    except Exception as e:
        print(f"Error checking profile fields: {e}")
        return None