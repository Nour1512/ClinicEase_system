# controllers/doctor_controller.py
from flask import Blueprint, render_template, jsonify, session, redirect, request
from repositories.doctor_repository import DoctorRepository

doctor_bp = Blueprint("doctor", __name__, url_prefix="/doctor")
doctor_repo = DoctorRepository()

@doctor_bp.route("/doctors")
def doctors_page():
    if "user_id" not in session:
        return redirect("/login")

    try:
        doctors = doctor_repo.get_all_doctors()
        return render_template('user/doctor/doctors.html', doctors=doctors)
    except ConnectionError as e:
        print(f"Database connection error : {e}")
        return render_template('user/doctor/doctors.html', doctors=[], error='database connection error')
    except Exception as e:
        print(f"Error in API endpoint: {e}")
        import traceback
        traceback.print_exc()
        return render_template('user/doctor/doctors.html', doctors=[], error=f'Server error: {str(e)}')

@doctor_bp.route("/api/doctors")
def get_doctors():
    doctors = doctor_repo.get_all_doctors()
    return jsonify({
        "success": True,
        "doctors": [d.to_dict() for d in doctors],
        "total": len(doctors)
    })

@doctor_bp.route("/api/doctors/search")
def search_doctors():
    name = request.args.get("name")
    doctors = doctor_repo.search_doctors(name=name)

    return jsonify({
        "success": True,
        "doctors": [d.to_dict() for d in doctors]
    })