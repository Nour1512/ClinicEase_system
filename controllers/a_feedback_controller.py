# controller/a_feedback_controller.py

from flask import Blueprint, render_template, request, jsonify, redirect, url_for
from repositories.a_feedback_repositry import FeedbackRepository
from models.a_feedback import Feedback


feedback_bp = Blueprint('feedback', __name__, template_folder='../templates')


@feedback_bp.route('/', methods=['GET'])
def list_feedback():
 
    status_filter = request.args.get('status', 'all')  # all, pending, approved, spam, trash
    type_filter = request.args.get('type', 'all_types')
    rating_filter = request.args.get('rating', 'all_ratings')
    search_query = request.args.get('search', '')

    
    repo = FeedbackRepository()
    feedback_list = repo.get_all_feedback(
        status=status_filter,
        feedback_type=type_filter,
        rating=rating_filter,
        search_term=search_query
    )

    
    context = {
        'feedback_list': feedback_list,
        'total_count': len(feedback_list),
        'current_status': status_filter,
        'current_type': type_filter,
        'current_rating': rating_filter,
        'search_query': search_query,
        'page_title': 'Admin Feedback',
        'active_nav': 'feedback'  
    }

    return render_template('a_feedback/a_feedback.html', **context)


@feedback_bp.route('/delete/<int:feedback_id>', methods=['POST'])
def delete_feedback(feedback_id):
    repo = FeedbackRepository()
    success = repo.delete_feedback(feedback_id)
    if success:
        return jsonify({'success': True, 'message': 'Feedback deleted successfully'})
    else:
        return jsonify({'success': False, 'message': 'Failed to delete feedback'})

@feedback_bp.route('/update-status/<int:feedback_id>', methods=['POST'])
def update_feedback_status(feedback_id):
    new_status = request.form.get('status')
    repo = FeedbackRepository()
    success = repo.update_feedback_status(feedback_id, new_status)
    if success:
        return jsonify({'success': True, 'message': f'Status updated to {new_status}'})
    else:
        return jsonify({'success': False, 'message': 'Failed to update status'})

