from flask import Blueprint, render_template, session, jsonify
from repositories.notifications_repository import NotificationRepository
from datetime import datetime

notification_bp = Blueprint("notifications", __name__)

repo = NotificationRepository()


@notification_bp.route("/notifications")
def notifications_page():
    if "user_id" not in session:
        # return render_template("errors/403.html")
        return "Access Denied", 403

    user_id = session["user_id"]
    role = session["role"]

    notifications = repo.get_notifications(user_id, role)
    unread_count = repo.count_unread(user_id, role)

    return render_template(
        "notifications.html",
        notifications=notifications,
        unread_count=unread_count,
        total_notifications=len(notifications),
        user_name=session["name"],
        user_role=role
    )


@notification_bp.route("/api/mark-read/<int:notification_id>", methods=["POST"])
def mark_read(notification_id):
    repo.mark_as_read(notification_id)
    return jsonify({"success": True})


@notification_bp.route("/api/mark-all-read", methods=["POST"])
def mark_all_read():
    repo.mark_all_as_read(session["user_id"], session["role"])
    return jsonify({"success": True})


@notification_bp.route("/api/count")
def unread_count():
    count = repo.count_unread(session["user_id"], session["role"])
    return jsonify({"count": count})