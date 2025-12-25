from flask import Blueprint, render_template, request, jsonify
from repositories.service_repository import ServiceRepository

# ✅ THIS LINE FIXES EVERYTHING
service_bp = Blueprint("service",__name__,url_prefix="/service")

repo = ServiceRepository()

# ---------- PAGE ----------
@service_bp.route("/")
def services_page():
    try:
        services = repo.get_all_services()
        total = len(services)
        return render_template(
            "service/service.html",
            services=services,
            total_services=total
        )
    except Exception as e:
        print(f"❌ PAGE ERROR: {e}")
        return "<h2>Service Page Error</h2>", 500


# ---------- API ----------
@service_bp.route("/api/get", methods=["GET"])
def get_services():
    try:
        services = repo.get_all_services()
        return jsonify([s.to_dict() for s in services])
    except Exception as e:
        print(f"❌ GET ERROR: {e}")
        return jsonify({"error": str(e)}), 500


@service_bp.route("/api/add", methods=["POST"])
def add_service():
    try:
        data = request.get_json()
        print("📥 ADD SERVICE DATA:", data)

        repo.add_service(data)

        return jsonify({
            "success": True,
            "message": "Service added successfully"
        }), 201
    except Exception as e:
        print(f"❌ ADD ERROR: {e}")
        return jsonify({"error": str(e)}), 500


@service_bp.route("/api/update", methods=["PUT"])
def update_service():
    try:
        data = request.get_json()
        repo.update_service(data)
        return jsonify({"success": True}), 200
    except Exception as e:
        print(f"❌ UPDATE ERROR: {e}")
        return jsonify({"error": str(e)}), 500


@service_bp.route("/api/delete/<int:id>", methods=["DELETE"])
def delete_service(id):
    try:
        repo.delete_service(id)
        return jsonify({"success": True}), 200
    except Exception as e:
        print(f"❌ DELETE ERROR: {e}")
        return jsonify({"error": str(e)}), 500
