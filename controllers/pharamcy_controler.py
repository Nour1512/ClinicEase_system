from flask import Blueprint, render_template, request, redirect, url_for, session , current_app , flash, jsonify
from authlib.integrations.flask_client import OAuth
from repositories.pharmacy_repository import PharmacyRepository
pharmacy_bp = Blueprint('pharmacy', __name__, template_folder='templates')
pharmacy_repo = PharmacyRepository()

@pharmacy_bp.route('/pharmacy')
def pharmacy_home():
    try:
        medicines = pharmacy_repo.get_all_medicines()
        return render_template('pharmacy/pharamcy.html', medicines=medicines)
    except Exception as e:
        print(f"Error loading medicines: {e}")
        return render_template('pharmacy/pharamcy.html', medicines=[], error=str(e))

@pharmacy_bp.route('/pharmacy/api/medicines', methods=['POST'])
def api_create_medicine():
    try:
        data = request.get_json()
        
        required_fields = ['MedicineName', 'Quantity', 'price', 'ExpiryDate', 'supplier']
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                return jsonify({'ok': False, 'error': f'Missing required field: {field}'}), 400
        
        from models.Pharmacy import Pharmacy
        medicine = Pharmacy(
            Medicine_id=None,
            MedicineName=data['MedicineName'],
            Quantity=int(data['Quantity']),
            price=float(data['price']),
            ExpiryDate=data['ExpiryDate'],
            supplier=data['supplier']
        )
        
        pharmacy_repo.create_medicine(medicine)
        
        return jsonify({'ok': True, 'message': 'Medicine added successfully'}), 201
    except ValueError as e:
        print(f"Validation error in create endpoint: {e}")
        return jsonify({'ok': False, 'error': f'Invalid data: {str(e)}'}), 400
    except Exception as e:
        print(f"Error in create endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': str(e)}), 500



@pharmacy_bp.route('/pharmacy/api/medicines', methods=['GET'])
def api_get_medicines(): 
    try:
        medicines = pharmacy_repo.get_all_medicines()
        medicines_dict = []
        for med in medicines:
            medicines_dict.append({
                'Medicine_id': str(med.Medicine_id) if med.Medicine_id else None,
                'MedicineName': str(med.MedicineName) if med.MedicineName else '',
                'Quantity': int(med.Quantity) if med.Quantity is not None else 0,
                'price': float(med.price) if med.price else 0.0,
                'ExpiryDate': str(med.ExpiryDate) if med.ExpiryDate else None,
                'supplier': str(med.supplier) if med.supplier else ''
            })
        return jsonify(medicines_dict)
    except ConnectionError as e:
        print(f"Database connection error : {e}")
        return jsonify({'error': 'database connection error'}), 503
    except Exception as e:
        print(f"Error in API endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@pharmacy_bp.route('/pharmacy/api/medicines/<medicine_id>/buy', methods=['POST'])
def api_buy_medicine(medicine_id):
    try:
        data = request.get_json()
        qty = data.get('qty', 1) if data else 1
        
        medicine = pharmacy_repo.get_medicine_by_ID(medicine_id)
        if not medicine:
            return jsonify({'ok': False, 'error': 'Medicine not found'}), 404
        
        if medicine.Quantity < qty:
            return jsonify({'ok': False, 'error': 'Insufficient stock'}), 400
        
        new_quantity = medicine.Quantity - qty
        pharmacy_repo.update_medicine_quantity(medicine_id, new_quantity)
        
        return jsonify({'ok': True, 'new_qty': new_quantity})
    except Exception as e:
        print(f"Error in buy endpoint: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500
 
@pharmacy_bp.route('/pharmacy/api/medicines/<medicine_id>', methods=['DELETE'])
def api_delete_medicine(medicine_id):
    try:
        medicine = pharmacy_repo.get_medicine_by_ID(medicine_id)
        if not medicine:
            return jsonify({'ok': False, 'error': 'Medicine not found'}), 404
        
        pharmacy_repo.delete_medicine(medicine_id)
        return jsonify({'ok': True})
    except Exception as e:
        print(f"Error in delete endpoint: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500
