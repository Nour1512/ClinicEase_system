from flask import Blueprint, jsonify, request, render_template
from repositories.a_feedback_repositry import AdminFeedbackRepository


admin_feedback_bp = Blueprint('admin_feedback_bp', __name__)

repo = AdminFeedbackRepository()

@admin_feedback_bp.route('/admin-feedback')
def admin_feedback_page():
   
    return render_template('a_feedback/a_feedback.html')



@admin_feedback_bp.route('/api/feedback', methods=['GET'])
# @admin_feedback_bp.route('/api/admin/feedback/', methods=['GET'])
def get_feedback_api():
   
    try:
        data = repo.get_all_feedback()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_feedback_bp.route('/api/feedback/update', methods=['POST'])
# @admin_feedback_bp.route('/api/admin/feedback/update/', methods=['POST'])
def update_feedback_api():

    data = request.json
    if not data or 'Id' not in data:
        return jsonify({"success": False, "message": "Missing ID"}), 400

    success = repo.update_feedback(
        f_id=data['Id'],
        admin=data.get('AdminName', 'Admin'),
        comments=data.get('Comments', ''),
        status=data.get('Status', 'pending')
    )

    if success:
        return jsonify({"success": True, "message": "Updated successfully"}), 200
    else:
        return jsonify({"success": False, "message": "Database update failed"}), 500