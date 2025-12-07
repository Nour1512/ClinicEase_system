from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from repositories.settings_repository import SettingsRepository

settings_bp = Blueprint('settings', __name__, template_folder='templates')
settings_repo = SettingsRepository()

@settings_bp.route('/settings')
def settings_home():
    try:
        # get current user id from session (recommended)
        user_id = session.get('user_id')
        if not user_id:
            
            return redirect(url_for('auth.login')) 
        
        settings = settings_repo.get_by_id(user_id)
        return render_template('user/Settings.html', settings=settings)
    except Exception as e:
        print(f"Error loading settings: {e}")
        # send an empty dict and the error string (your original behaviour)
        return render_template('user/Settings.html', settings={}, error=str(e))


@settings_bp.route('/settings/api/change_password', methods=['POST'])
def api_change_password():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        new_password = data.get('new_password')
        if not user_id or not new_password:
            return jsonify({'ok': False, 'error': 'Missing user_id or new_password'}), 400
        settings_repo.Change_Password(user_id, new_password)
        return jsonify({'ok': True, 'message': 'Password changed successfully'}), 200
    except Exception as e:
        print(f"Error in change_password endpoint: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500


@settings_bp.route('/settings/api/change_email', methods=['POST'])
def api_change_email():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        new_email = data.get('new_email')
        if not user_id or not new_email:
            return jsonify({'ok': False, 'error': 'Missing user_id or new_email'}), 400
        settings_repo.change_email(user_id, new_email)
        return jsonify({'ok': True, 'message': 'Email changed successfully'}), 200
    except Exception as e:
        print(f"Error in change_email endpoint: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500


@settings_bp.route('/settings/api/change_name', methods=['POST'])
def api_change_name():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        new_name = data.get('new_name')
        if not user_id or not new_name:
            return jsonify({'ok': False, 'error': 'Missing user_id or new_name'}), 400
        settings_repo.change_name(user_id, new_name)
        return jsonify({'ok': True, 'message': 'Name changed successfully'}), 200
    except Exception as e:
        print(f"Error in change_name endpoint: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500
