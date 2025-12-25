from flask import Blueprint, jsonify, request, render_template
from  repositories.p_feedback_repositor import PatientFeedbackRepository
from datetime import datetime

patient_feedback_bp = Blueprint("patient_feedback_bp", __name__)
repo = PatientFeedbackRepository()

@patient_feedback_bp.route("/patient-feedback", methods=["GET"])
def patient_feedback_page():
    return render_template("p_feedback/p_feedback.html")

@patient_feedback_bp.route("/api/patient/feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400

    if not data.get("patient_name"):
        return jsonify({"success": False, "message": "'patient_name' is required"}), 400

    rating_fields = ["doctor_knowledge", "doctor_kindness", "nurse_patience", "nurse_knowledge", "waiting_time", "hygiene"]
    ratings = [data.get(f) for f in rating_fields if data.get(f) is not None]
    overall_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0

    try:
        repo.save_feedback_raw(
            patient_name=data["patient_name"],
            gender=data.get("gender"),
            doctor_knowledge=data.get("doctor_knowledge"),
            doctor_kindness=data.get("doctor_kindness"),
            nurse_patience=data.get("nurse_patience"),
            nurse_knowledge=data.get("nurse_knowledge"),
            waiting_time=data.get("waiting_time"),
            hygiene=data.get("hygiene"),
            improvement_suggestions=data.get("improvement_suggestions"),
            overall_rating=overall_rating,
            submission_date=datetime.now().strftime('%Y-%m-%d'),
            status="pending"
        )
        return jsonify({"success": True, "message": "Feedback saved successfully"}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500