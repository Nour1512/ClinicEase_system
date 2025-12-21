# controllers/dashboard_controller.py
from flask import Blueprint, render_template, jsonify, session, redirect, url_for
from repositories.dashboard_repository import DashboardRepository
import json

dashboard_bp = Blueprint("dashboard", __name__)
dashboard_repo = DashboardRepository()

@dashboard_bp.route("/dashboard")
def dashboard():
    """Main dashboard route"""
    if "user_id" not in session:
        return redirect(url_for("auth.login"))
    
    user_role = session.get("role", "patient")
    user_name = session.get("name", "User")
    
    # Get dashboard data
    stats = dashboard_repo.get_dashboard_stats(user_role, session["user_id"])
    recent_activities = dashboard_repo.get_recent_activities(8)
    upcoming_appointments = dashboard_repo.get_upcoming_appointments(user_role, session["user_id"], 5)
    
    # Prepare data for charts
    specialty_data = dashboard_repo.get_doctor_specialty_distribution()
    revenue_data = dashboard_repo.get_revenue_by_month()
    
    # Prepare specialty data for pie chart
    specialty_labels = [item["specialty"] for item in specialty_data]
    specialty_counts = [item["count"] for item in specialty_data]
    
    # Prepare revenue data for line chart
    revenue_months = [item["month"] for item in revenue_data]
    revenue_amounts = [item["revenue"] for item in revenue_data]
    
    return render_template(
        "dashboard.html",
        name=user_name,
        role=user_role.capitalize(),
        stats=stats,
        recent_activities=recent_activities,
        upcoming_appointments=upcoming_appointments,
        specialty_labels=json.dumps(specialty_labels),
        specialty_counts=json.dumps(specialty_counts),
        revenue_months=json.dumps(revenue_months),
        revenue_amounts=json.dumps(revenue_amounts)
    )

@dashboard_bp.route("/api/dashboard/stats")
def get_dashboard_stats():
    """API endpoint for dashboard statistics (AJAX)"""
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    user_role = session.get("role", "patient")
    stats = dashboard_repo.get_dashboard_stats(user_role, session["user_id"])
    
    if stats:
        return jsonify({
            "total_patients": stats.total_patients,
            "total_doctors": stats.total_doctors,
            "total_appointments": stats.total_appointments,
            "total_revenue": stats.total_revenue,
            "pending_appointments": stats.pending_appointments,
            "today_appointments": stats.today_appointments,
            "available_doctors": stats.available_doctors,
            "low_stock_medicines": stats.low_stock_medicines
        })
    return jsonify({"error": "Failed to fetch stats"}), 500

@dashboard_bp.route("/api/dashboard/activities")
def get_recent_activities():
    """API endpoint for recent activities (AJAX)"""
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    activities = dashboard_repo.get_recent_activities(10)
    
    activities_data = []
    for activity in activities:
        activities_data.append({
            "id": activity.activity_id,
            "user_type": activity.user_type,
            "user_name": activity.user_name,
            "action": activity.action,
            "time": activity.timestamp.strftime("%I:%M %p"),
            "date": activity.timestamp.strftime("%b %d, %Y"),
            "icon": activity.icon
        })
    
    return jsonify(activities_data)

@dashboard_bp.route("/api/dashboard/appointments")
def get_upcoming_appointments():
    """API endpoint for upcoming appointments (AJAX)"""
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    user_role = session.get("role", "patient")
    appointments = dashboard_repo.get_upcoming_appointments(user_role, session["user_id"], 5)
    
    appointments_data = []
    for appointment in appointments:
        appointments_data.append({
            "id": appointment.appointment_id,
            "patient_name": appointment.patient_name,
            "doctor_name": appointment.doctor_name,
            "date": appointment.appointment_date.strftime("%b %d, %Y"),
            "time": appointment.time_slot,
            "status": appointment.status
        })
    
    return jsonify(appointments_data)
# In controllers/dashboard_controller.py
@dashboard_bp.route("/dashboard")
def dashboard():
    """Redirect to doctors page"""
    return redirect("/doctors")