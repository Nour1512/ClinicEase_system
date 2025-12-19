# doctor_controller.py
from flask import Blueprint, render_template, session , redirect, url_for
from repositories.patient_repository import PatientRepository

doctor_bp = Blueprint("doctor", __name__)

patient_repo = PatientRepository()
# appointment_repo = AppointmentRepository()

# @doctor_bp.route('/patients')
# def doctor_patients():
#     doctor_id = session["user_id"]
#     patients = patient_repo.get_patients_by_doctor(doctor_id)
#     return render_template('doctor/patients.html', patients=patients)


@doctor_bp.route("/patients")
def patients_list():
    if session.get("role") != "doctor":
        return redirect(url_for("auth.login"))
    # Load doctor's patients logic here
    return render_template("user/admin/patients.html", name=session.get("name"))




# @doctor_bp.route('/appointments')
# def doctor_appointments():
#     doctor_id = session["user_id"]
#     appointments = appointment_repo.get_appointments_by_doctor(doctor_id)
#     return render_template('doctor/appointments.html', appointments=appointments)