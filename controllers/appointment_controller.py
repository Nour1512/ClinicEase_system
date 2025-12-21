from flask import Blueprint, jsonify, request, render_template, session
from repositories.appointment_repository import AppointmentRepository

appointment_bp = Blueprint("appointment_bp", __name__)
repo = AppointmentRepository()

# --- API ROUTES (NO CHANGES) ---
@appointment_bp.route("/Book", methods=["GET"])
def get_appointments():
    doctor_id = request.args.get("doctor_id")
    appointments = repo.get_appointments(doctor_id)
    return jsonify([{
        "appointment_id": a.appointment_id,
        "patient_id": a.patient_id,
        "patient_name": a.patient_name,
        "doctor_id": a.doctor_id,
        "doctor_name": a.doctor_name,
        "appointment_date": str(a.appointment_date),
        "status": a.status,
        "payment_status": a.payment_status,
        "notes": a.notes
    } for a in appointments]), 200


@appointment_bp.route("/api/appointments/role-based", methods=["GET"])
def get_role_based_appointments():
    """Return appointments based on user role"""
    if "user_id" not in session or "role" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    role = session["role"]
    user_id = session["user_id"]
    
    if role == "admin":
        # Admin sees all appointments
        appointments = repo.get_appointments()
    elif role == "doctor":
        # Doctor sees their own appointments
        appointments = repo.get_appointments(doctor_id=user_id)
    elif role == "patient":
        # Patient sees their own appointments
        appointments = repo.get_patient_appointments(patient_id=user_id)
    else:
        return jsonify({"error": "Invalid role"}), 400
    
    return jsonify([{
        "appointment_id": a.appointment_id,
        "patient_id": a.patient_id,
        "patient_name": a.patient_name,
        "doctor_id": a.doctor_id,
        "doctor_name": a.doctor_name,
        "appointment_date": str(a.appointment_date),
        "status": a.status,
        "payment_status": a.payment_status,
        "notes": a.notes
    } for a in appointments]), 200



@appointment_bp.route("/", methods=["POST"])
def create_appointment():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    for field in ["patient_id", "doctor_id", "appointment_date"]:
        if field not in data:
            return jsonify({"error": f"'{field}' is required"}), 400

    appointment_id = repo.create_appointment(
        patient_id=data["patient_id"],
        doctor_id=data["doctor_id"],
        appointment_date=data["appointment_date"],
        notes=data.get("notes")
    )
    return jsonify({
        "message": "Appointment created",
        "appointment_id": appointment_id
    }), 201

@appointment_bp.route("/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):
    repo.delete_appointment(appointment_id)
    return jsonify({"message": "Appointment deleted"}), 200

@appointment_bp.route("/<int:appointment_id>/status", methods=["PUT"])
def update_appointment_status(appointment_id):
    data = request.get_json()
    if not data or "status" not in data:
        return jsonify({"error": "Status is required"}), 400
    repo.update_status(appointment_id, data["status"])
    return jsonify({"message": "Status updated"}), 200

# --- PAGE ROUTE (CRITICAL FIX: template path) ---
@appointment_bp.route("/", methods=["GET"])  # ← Changed from "/appointments"
def appointment_page():
    return render_template("appointment/appointment.html")


from flask import flash, redirect, url_for
@appointment_bp.route("/book-appointment", methods=["GET", "POST"])
def book_appointment():
    if request.method == "POST":
        # Handle form submission here
        patient_id = request.form.get("patient_id")
        doctor_id = request.form.get("doctor_id")
        appointment_date = request.form.get("appointment_date")
        notes = request.form.get("notes")
        # ... validate and save to DB
        flash("Appointment booked successfully!", "success")
        return redirect(url_for('appointment_bp.appointment_page'))  # back to list

    # GET: show the booking form
    return render_template("bookAppointment/bookApp.html")
