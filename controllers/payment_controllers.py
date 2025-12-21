
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify , session
from repositories.payment_repository import PaymentRepository
from repositories.purchase_repository import PurchaseRepository

payment_bp = Blueprint("payment", __name__, template_folder='templates')
payment_repo = PaymentRepository()
purchase_repo = PurchaseRepository()

@payment_bp.route("/payment/form")
def payment_form():
    purchase_id = request.args.get('purchase_id')
    if not purchase_id:
        flash("Invalid payment request", "error")
        return redirect(url_for("pharmacy.index"))
    
    purchase = purchase_repo.get_purchase_by_id(purchase_id)
    if not purchase or purchase['patient_id'] != session.get("user_id"):
        flash("Unauthorized purchase", "error")
        return redirect(url_for("pharmacy.index"))
    
    return render_template("payments/credit_card.html", 
                         purchase_id=purchase_id, 
                         amount=purchase['total_amount'])
@payment_bp.route("/payments/create", methods=["POST"])
def create_payment():
    try:
        purchase_id = int(request.form.get("purchase_id"))
        amount = float(request.form.get("amount"))

        card_number = request.form.get("card_number", "").replace(" ", "")
        cardholder_name = request.form.get("cardholder_name", "")
        expiry_date = request.form.get("expiry_date", "")
        cvv = request.form.get("cvv", "")

        if not all([card_number, cardholder_name, expiry_date, cvv]):
            return jsonify({"success": False, "message": "All fields are required"}), 400

        if not cvv.isdigit() or len(cvv) != 3:
            return jsonify({"success": False, "message": "Invalid CVV"}), 400

        # Detect card
        if card_number.startswith("4"):
            card_type = "VISA"
        elif card_number.startswith(("51","52","53","54","55")):
            card_type = "MasterCard"
        else:
            card_type = "Credit Card"

        # Create payment
        payment_id = payment_repo.create_payment({
            "purchase_id": purchase_id,
            "amount": amount,
            "payment_method": f"{card_type} ending in {card_number[-4:]}",
            "status": "Success"
        })

        purchase_repo.update_purchase_status(purchase_id, "Paid")

        return jsonify({
            "success": True,
            "message": "Payment processed successfully!",
            "payment_id": payment_id,
            "redirect_url": url_for("payment.after_payment_page")
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({
            "success": False,
            "message": f"Payment failed: {str(e)}"
        }), 500

@payment_bp.route("/payment-page")
def payment_page():
    return render_template("payments/credit_card.html")

@payment_bp.route("/after-payment-page")
def after_payment_page():
    return render_template("user/confirmation.html")