from flask import request, jsonify
# from repositries.invoice_repository import InvoiceRepositor
from repositories.invoice_repository import InvoiceRepository
class InvoiceController:
    _repository = InvoiceRepository()

    @staticmethod
    def get_all_invoices():
        try:
            invoices = InvoiceController._repository.get_all_invoices()
            return jsonify(invoices)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def create_invoice():
        try:
            data = request.get_json()
            
            # Validate required fields
            if not data.get('client_name') or not data.get('amount'):
                return jsonify({"error": "client_name and amount are required"}), 400
            
            # Add invoice
            new_invoice = InvoiceController._repository.add_invoice(data)
            return jsonify(new_invoice), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_invoice(invoice_id):
        try:
            success = InvoiceController._repository.delete_invoice(invoice_id)
            if success:
                return jsonify({"message": f"Invoice {invoice_id} deleted successfully"}), 200
            else:
                return jsonify({"error": f"Invoice {invoice_id} not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500