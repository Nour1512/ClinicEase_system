# admin_controller.py
from flask import Blueprint, render_template , session, redirect, url_for
from repositories.patient_repository import PatientRepository
from repositories.doctor_repository import DoctorRepository
admin_bp = Blueprint("admin", __name__)

patient_repo = PatientRepository()
doctor_repo = DoctorRepository()

# @admin_bp.route('/patients')
# def admin_patients():
#     patients = patient_repo.get_all_patients()
#     return render_template('user/admin/patients.html', patients=patients)




@admin_bp.route("/patients")
def patients_list():
    if session.get("role") != "admin":
        return redirect(url_for("auth.login"))
    # Load patients logic here
    return render_template("user/admin/patients.html", name=session.get("name"))



# @admin_bp.route('/doctors')
# def admin_doctors():
#     doctors = doctor_repo.get_all_doctors()
#     return render_template('user/doctor/doctors.html', doctors=doctors)