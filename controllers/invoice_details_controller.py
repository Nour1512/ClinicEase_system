from flask import Blueprint, render_template, request, abort
from models.invoice_details import Invoice
from repositories.invoice_details_repository import InvoiceRepository

# Same naming convention as your reference
invoice_bp = Blueprint("invoice", __name__)
repo = InvoiceRepository()

@invoice_bp.route("/invoice-page", methods=["GET"])
def list_invoices():
    print("🔍 DEBUG: Attempting to fetch all invoices...")
    try:
        all_invoices = repo.get_all_invoices()
        
        if not all_invoices:
            print("⚠️ DEBUG: Repository returned 0 results. Check purchase table.")
            return "<h2>No invoices found in database. ❌</h2>"

        print(f"✅ DEBUG: Found {len(all_invoices)} invoices. Sending to template.")
        # 'invoice' variable matches your HTML and JS expectations
        return render_template("invoice/invoice_details.html", invoice=all_invoices[0])
        
    except Exception as e:
        print(f"🔥 ERROR in invoice controller: {e}")
        return f"<h2>Error: {e}</h2>", 500

@invoice_bp.route("/invoice/details/<int:id>", methods=["GET"])
def invoice_details(id):
    print(f"🔍 DEBUG: Fetching details for Invoice ID: {id}")
    try:
        invoice_data = repo.get_invoice_by_id(id)
        if not invoice_data:
            print(f"⚠️ DEBUG: Invoice {id} not found.")
            abort(404)
            
        return render_template("invoice/invoice_details.html", invoice=invoice_data)
    except Exception as e:
        print(f"🔥 ERROR: {e}")
        return f"<h2>Error: {e}</h2>", 500