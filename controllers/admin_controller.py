from flask import Blueprint, jsonify, request
from repositories.a_feedback_repositry import AdminFeedbackRepository

admin_feedback_bp = Blueprint(
    'admin_feedback_bp',
    __name__,
    url_prefix='/api/admin'
)

repo = AdminFeedbackRepository()


@admin_feedback_bp.route('/feedback', methods=['GET'])
@admin_feedback_bp.route('/feedback/', methods=['GET'])
def get_admin_feedback():
    data = repo.get_all_feedback()
    return jsonify(data)


@admin_feedback_bp.route('/feedback/update', methods=['POST'])
@admin_feedback_bp.route('/feedback/update/', methods=['POST'])
def update_feedback():
    data = request.json

    repo.update_feedback(
        data['Id'],
        data.get('AdminName', 'Admin'),
        data.get('Comments', ''),
        data.get('Status', 'pending')
    )

    return jsonify({
        "success": True,
        "message": "Feedback updated successfully"
    })
