from flask import Blueprint, render_template, request, jsonify
from repositories.service_repository import ServiceRepository


service_bp = Blueprint('service', __name__, url_prefix='/service')


repo = ServiceRepository()

@service_bp.route('/')
def services_page():
    try:
     
        services = repo.get_all_services()
        total = repo.get_total_services()
        
     
        return render_template('service.html', 
                             services=services, 
                             total_services=total)
    except Exception as e:
        return f"Error: {str(e)}", 500

# ========== API ROUTES ==========


@service_bp.route('/api/get', methods=['GET'])
def get_services():
    try:
        services = repo.get_all_services()
        services_list = []
        for s in services:
            services_list.append({
                'service_id': s.service_id,
                'service_name': s.service_name,
                'department': s.department,
                'price': s.price,
                'status': s.status,
                'created_at': str(s.created_at)
            })
        return jsonify(services_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_bp.route('/api/add', methods=['POST'])
def add_service():
    try:
        data = request.json  
        
       
        if not data.get('service_name') or not data.get('department'):
            return jsonify({'error': 'Service name and department are required'}), 400
        
    
        repo.add_service({
            'service_name': data['service_name'],
            'department': data['department'],
            'price': data['price'],
            'status': data['status']
        })
        
        return jsonify({'message': 'Service added successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_bp.route('/api/update', methods=['PUT'])
def update_service():
    try:
        data = request.json
        
        if not data.get('service_id'):
            return jsonify({'error': 'Service ID is required'}), 400
        
        repo.update_service({
            'service_id': data['service_id'],
            'service_name': data['service_name'],
            'department': data['department'],
            'price': data['price'],
            'status': data['status']
        })
        
        return jsonify({'message': 'Service updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_bp.route('/api/delete/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):
    try:
        repo.delete_service(service_id)
        return jsonify({'message': f'Service {service_id} deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_bp.route('/api/search', methods=['GET'])
def search_services():
    try:
        keyword = request.args.get('q', '')
        services = repo.search_services(keyword)
        
        services_list = []
        for s in services:
            services_list.append({
                'service_id': s.service_id,
                'service_name': s.service_name,
                'department': s.department,
                'price': s.price,
                'status': s.status
            })
        return jsonify(services_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500