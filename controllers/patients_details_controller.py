from flask import Blueprint, render_template, session, redirect, url_for, flash, request
from repositories.patients_details_repository import patient_details_repository
from models.patient_details import patient_details

patients_details_bp = Blueprint("patients_details", __name__)
repo = patient_details_repository()


@patients_details_bp.route("/patient_details/<int:patient_id>")
def patient_details_page(patient_id):
    if "user_id" not in session:
        flash("Please login first", "error")
        return redirect(url_for("auth.login"))

    role = session.get("role")
    patient_details = repo.get_patient_detail_by_id(patient_id)

    if not patient_details:
        flash("Patient details not found", "error")
        return render_template("patient_detailes_form.html", patient_id=patient_id)
    if patient_details:
        return render_template(
            "patient_details.html",
            patient=patient_details,
            role=role
        )

    


@patients_details_bp.route("/patient_details/<int:patient_id>/update", methods=["POST"])
def update_patient_details(patient_id):
    patient = patient_details(
        patient_id=patient_id,
        blood_type=request.form["blood_type"],
        height_cm=request.form["height_cm"],
        weight_kg=request.form["weight_kg"],
        medical_record=request.form["medical_record"],
        current_medications=request.form["current_medications"],
        medical_notes=request.form["medical_notes"],
        emergency_contact_name=request.form["emergency_contact_name"],
        emergency_contact_phone=request.form["emergency_contact_phone"]
    )

    repo.update_patient_details(patient)
    flash("Patient details updated successfully", "success")
    return redirect(url_for("patients_details.patient_details_page", patient_id=patient_id))

# @patients_details_bp.route("/patient_details/add/<int:patient_id>", methods=["GET", "POST"])
# def add_patient_details(patient_id):
#     if "user_id" not in session:
#         flash("Please login first", "error")
#         return redirect(url_for("auth.login"))

#     if request.method == "POST":
#         patient = patient_detailes(
#             patient_id=patient_id,
#             blood_type=request.form["blood_type"],
#             height_cm=request.form["height_cm"],
#             weight_kg=request.form["weight_kg"],
#             medical_record=request.form["medical_record"],
#             current_medications=request.form["current_medications"],
#             medical_notes=request.form["medical_notes"],
#             emergency_contact_name=request.form["emergency_contact_name"],
#             emergency_contact_phone=request.form["emergency_contact_phone"]
#         )

#         repo.add_patient_details(patient)  # you'll add this repo method
#         flash("Patient details added successfully", "success")
#         return redirect(
#             url_for("patients_details.patient_details_page", patient_id=patient_id)
#         )

#     return render_template("patient/add_patient_details.html", patient_id=patient_id)
@patients_details_bp.route("/patient_details/<int:patient_id>/add", methods=["POST"])
def add_patient_details(patient_id):

    if "user_id" not in session:
        flash("Please login first", "error")
        return redirect(url_for("auth.login"))

    try:
        required_fields = [
            "blood_type",
            "height_cm",
            "weight_kg",
            "medical_record",
            "current_medications",
            "medical_notes",
            "emergency_contact_name",
            "emergency_contact_phone"
        ]

        for field in required_fields:
            if not request.form.get(field):
                flash(f"Missing required field: {field}", "error")
                return redirect(
                    url_for("patients_details.patient_details_page", patient_id=patient_id)
                )

        from models.patient_details import patient_details

        patient = patient_details(
            patient_id=patient_id,
            blood_type=request.form["blood_type"],
            height_cm=float(request.form["height_cm"]),
            weight_kg=float(request.form["weight_kg"]),
            medical_record=request.form["medical_record"],
            current_medications=request.form["current_medications"],
            medical_notes=request.form["medical_notes"],
            emergency_contact_name=request.form["emergency_contact_name"],
            emergency_contact_phone=request.form["emergency_contact_phone"]
        )

        repo.add_patient_details(patient)
        flash("Patient details added successfully", "success")

    except Exception as e:
        import traceback
        traceback.print_exc()
        flash("Error adding patient details", "error")

    return redirect(
        url_for("patients_details.patient_details_page", patient_id=patient_id)
    )
