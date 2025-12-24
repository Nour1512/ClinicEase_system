from flask import Blueprint, render_template, request, jsonify
from repositories.service_repository import ServiceRepository

service_bp = Blueprint('service', __name__, url_prefix='/service')
repo = ServiceRepository()

# ---------- PAGE ----------
@service_bp.route('/')
def services_page():
    services = repo.get_all_services()
    total = repo.get_total_services()
    return render_template(
        'service.html',
        services=services,
        total_services=total
    )

# ---------- APIs ----------
@service_bp.route('/api/get', methods=['GET'])
def get_services():
    services = repo.get_all_services()
    return jsonify([s.to_dict() for s in services])

@service_bp.route('/api/add', methods=['POST'])
def add_service():
    data = request.json
    repo.add_service(data)
    return jsonify({'message': 'Service added successfully'})

@service_bp.route('/api/update', methods=['PUT'])
def update_service():
    data = request.json
    repo.update_service(data)
    return jsonify({'message': 'Service updated successfully'})

@service_bp.route('/api/delete/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):
    repo.delete_service(service_id)
    return jsonify({'message': 'Service deleted successfully'})

@service_bp.route('/api/search', methods=['GET'])
def search_services():
    keyword = request.args.get('q', '')
    services = repo.search_services(keyword)
    return jsonify([s.to_dict() for s in services])
