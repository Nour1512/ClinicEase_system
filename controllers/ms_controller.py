from flask import Blueprint, render_template, jsonify, request
from repositories.ms_repository import MedicineStockRepository

ms_blueprint = Blueprint(
    'medicine_stock',
    __name__,
    url_prefix='/medicine-stock'
)

repo = MedicineStockRepository()


@ms_blueprint.route('/')
def page():
    return render_template('ms_html/index.html')


@ms_blueprint.route('/api/medicines', methods=['GET'])
def get_all():
    return jsonify(repo.get_all())


@ms_blueprint.route('/api/medicines/search', methods=['GET'])
def search():
    q = request.args.get('q', '')
    return jsonify(repo.search(q))


@ms_blueprint.route('/api/medicines', methods=['POST'])
def add_medicine():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    medicine = repo.create(data)
    return jsonify(medicine.to_dict()), 201


@ms_blueprint.route('/api/medicines/<int:medicine_id>', methods=['PUT'])
def update_medicine(medicine_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    updated_medicine = repo.update(medicine_id, data)
    if not updated_medicine:
        return jsonify({'error': 'Medicine not found'}), 404

    return jsonify(updated_medicine.to_dict())


@ms_blueprint.route('/api/medicines/<int:medicine_id>', methods=['DELETE'])
def delete_medicine(medicine_id):
    success = repo.delete(medicine_id)
    if success:
        return jsonify({'message': 'Medicine deleted successfully'})
    return jsonify({'error': 'Medicine not found'}), 404


@ms_blueprint.route('/ping')
def ping():
    return {"ping": "backend is alive"}