from flask import Blueprint, render_template, session, redirect, url_for, flash , jsonify, request
from repositories.patient_repository import PatientRepository

patients_bp = Blueprint("patients", __name__)
patient_repo = PatientRepository()

# @patients_bp.route("/patients")
# def patients_page():
#     if "user_id" not in session or "role" not in session:
#         flash("Please login first", "error")
#         return redirect(url_for("auth.login"))

#     repo = PatientRepository()
#     role = session["role"]

#     # ✅ Admin sees all patients
#     if role == "admin":
#         patients = repo.get_all_patients()

#     # ✅ Doctor sees only his patients
#     elif role == "doctor":
#         doctor_id = session["user_id"]
#         patients = repo.get_patients_by_doctor(doctor_id)

#     else:
#         flash("Unauthorized access", "error")
#         return redirect(url_for("home"))

#     return render_template(
#         "admin/patients.html",
#         patients=patients,
#         role=role
#     )




@patients_bp.route("/patients")
def patients_page():
    if "user_id" not in session or "role" not in session:
        flash("Please login first", "error")
        return redirect(url_for("auth.login"))

    repo = PatientRepository()
    role = session["role"]

    if role == "admin":
        patients = repo.get_all_patients()
    elif role == "doctor":
        doctor_id = session["user_id"]
        patients = repo.get_patients_by_doctor(doctor_id)
    else:
        flash("Unauthorized access", "error")
        return redirect(url_for("home"))

    # ✅ Convert Patient objects to dictionaries for the template
    patients_dict = [
        {
            'patient_id': p.patient_id,
            'full_name': p.full_name,
            'email': p.email,
            'medical_history': p.medical_history,
            'address': p.address,
            'dob': p.dob,
            'gender': p.gender,
            'emergency_contact': p.emergency_contact
        }
        for p in patients
    ]

    return render_template(
        "admin/patients.html",
        patients=patients_dict,  # ← Pass dictionaries
        role=role
    )


# sha8ala

# @patients_bp.route('/api/patients', methods=['GET'])
# def api_get_patients():
#     patients = patient_repo.get_all_patients()
#     # ✅ Convert Patient objects to dictionaries
#     patients_dict = [
#         {
#             'patient_id': p.patient_id,
#             'full_name': p.full_name,
#             'email': p.email,
#             'medical_history': p.medical_history,
#             'address': p.address,
#             'dob': p.dob,
#             'gender': p.gender,
#             'emergency_contact': p.emergency_contact
#         }
#         for p in patients
#     ]
#     return jsonify(patients_dict)








@patients_bp.route('/api/patients', methods=['GET'])
def api_get_patients():
    if session.get("role") == "doctor":
        # ✅ Get only doctor's patients
        doctor_id = session["user_id"]
        patients = patient_repo.get_patients_by_doctor(doctor_id)
    else:
        # ✅ Admin sees all patients
        patients = patient_repo.get_all_patients()
    
    patients_dict = []
    for p in patients:
        patients_dict.append({
            'patient_id': p.patient_id,
            'full_name': p.full_name,
            'email': p.email,
            'medical_history': p.medical_history,
            'address': p.address,
            'dob': p.dob,
            'gender': p.gender,
            'emergency_contact': p.emergency_contact
        })
    return jsonify(patients_dict)






@patients_bp.route('/api/patients', methods=['POST'])
def api_create_patient():
    try:
        data = request.get_json()
        required_fields = ['full_name', 'email', 'dob', 'gender', 'address', 'emergency_contact']
        
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        patient_repo = PatientRepository()
        patient_repo.create_patient_from_admin(
            full_name=data['full_name'],
            email=data['email'],
            dob=data['dob'],
            gender=data['gender'],
            address=data['address'],
            emergency_contact=data['emergency_contact']
        )
        
        return jsonify({'message': 'Patient created successfully'}), 201
        
    except Exception as e:
        print(f"Error creating patient: {e}")
        return jsonify({'error': 'Failed to create patient'}), 500







@patients_bp.route("/complete-profile", methods=["GET", "POST"])
def complete_profile():
    if session.get("role") != "patient":
        return redirect(url_for("auth.login"))
    
    patient_id = session["user_id"]
    patient_repo = PatientRepository()
    patient = patient_repo.get_patient_by_id(patient_id)
    
    required_fields = [
        'dob', 'gender', 'address', 
        'emergency_contact', 'medical_history'
    ]
    
    # Get only missing fields
    # missing_fields = {
    #     field: field.replace('_', ' ').title() 
    #     for field in required_fields 
    #     if not getattr(patient, field, None)
    # }

    missing_fields = {}
    for field in required_fields:
        value = getattr(patient, field, None)
        # Check for None (NULL) OR empty string
        if value is None or (isinstance(value, str) and value.strip() == ""):
            missing_fields[field] = field.replace('_', ' ').title()
    
    if request.method == "POST":
        update_data = {}
        for field in missing_fields:
            if field in request.form and request.form[field].strip():
                update_data[field] = request.form[field].strip()
        
        if update_data:
            patient_repo.update_patient_profile_dynamic(patient_id, update_data)
            # Redirect to dashboard or show success
            return redirect(url_for("pharmacy.pharmacy_home"))
    
    return render_template("user/patient/complete_profile.html", missing_fields=missing_fields)