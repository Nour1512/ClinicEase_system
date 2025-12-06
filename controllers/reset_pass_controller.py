from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_mail import Message
from repositories.patient_repository import PatientRepository
from repositories.reset_pass_repository import ResetPassRepository
from datetime import datetime, timedelta
import secrets
import os

password_reset_bp = Blueprint("password_reset", __name__)

def send_reset_email(email, code):
    from app import mail
    msg = Message(
        subject="Password Reset Code",
        sender=os.getenv("EMAIL_USER"),
        recipients=[email],
        # body=f"Your password reset code is: {code}\n\nValid for 2 minutes."
        html=f"""
<html>
<head>
<style>
    .box {{
        background: #ffffff;
        padding: 25px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        color: #333;
        border: 1px solid #e6e6e6;
    }}
    .code {{
        display: inline-block;
        padding: 12px 20px;
        background: #5874cd;
        color: white;
        font-size: 22px;
        font-weight: bold;
        border-radius: 8px;
        margin-top: 10px;
    }}
    .footer {{
        margin-top: 25px;
        font-size: 12px;
        color: #777;
    }}
</style>
</head>
<body>
<div class="box">
    <h2>Password Reset Request</h2>
    <p>Hello,</p>
    <p>You requested to reset your ClinicEase account password.</p>

    <p>Your verification code:</p>
    <div class="code">{code}</div>

    <p>This code is valid for <strong>2 minutes</strong>.</p>

    <p>If you did not request this action, you may safely ignore this email.</p>

    <div class="footer">
        ClinicEase © 2023 | Security Team
    </div>
</div>
</body>
</html>
"""

    )
    mail.send(msg)

@password_reset_bp.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():
    if request.method == "GET":
        return render_template("forgot_pass.html")
    
    repo = ResetPassRepository()
    patient_repo = PatientRepository()
    
    if request.method == "POST":
        email = request.form["email"]
        print(f"Processing reset for: {email}")
        user = patient_repo.get_patient_by_email(email)
        
        if not user:
            flash("If an account exists, a reset code was sent.", "info")
            return redirect(url_for("password_reset.forgot_password"))

        code = f"{secrets.randbelow(1000000):06d}"
        expires = datetime.now() + timedelta(minutes=2)
        
        try:
            repo.save_reset_code(email, code, expires)
            send_reset_email(email, code)
            flash("Reset code sent to your email.", "success")
        except Exception as e:
            print(f"Reset error: {e}")
            flash("Failed to process request. Please try again.", "error")
            return redirect(url_for("password_reset.forgot_password"))

        return redirect(url_for("password_reset.verify_reset_code", email=email))
    
    # return render_template("forgot_pass.html")

@password_reset_bp.route("/verify-reset-code", methods=["GET", "POST"])
def verify_reset_code():
    repo = ResetPassRepository()
    email = request.form.get("email") or request.args.get("email")
    
    if not email:
        return redirect(url_for("password_reset.forgot_password"))
    
    if request.method == "GET":
        return render_template("verify_code.html", email=email)

    if request.method == "POST":
        code = request.form["code"]
        row = repo.get_reset_code(email)
        
        if not row or row[2]:  # No row or already used
            flash("Invalid or expired code.", "error")
            return redirect(url_for("password_reset.forgot_password"))
        
        stored_code, expires_at, _ = row
        if datetime.now() > expires_at:
            flash("Code expired. Request a new one.", "error")
            return redirect(url_for("password_reset.forgot_password"))
        if code != stored_code:
            flash("Incorrect code.", "error")
            return render_template("verify_code.html", email=email)

        repo.mark_code_as_used(email)
        session["reset_email"] = email
        return redirect(url_for("password_reset.reset_password"))

    # return render_template("verify_code.html", email=email)


@password_reset_bp.route("/password-changed")
def password_changed():
    return render_template("pass_changed.html")


@password_reset_bp.route("/reset-password", methods=["GET", "POST"])
def reset_password():
    repo = ResetPassRepository()
    if "reset_email" not in session:
        return redirect(url_for("password_reset.forgot_password"))
    
    if request.method == "GET":
        return render_template("reset_pass.html")
    
    if request.method == "POST":
        # from werkzeug.security import generate_password_hash
        password = request.form["password"]
        email = session["reset_email"]
        # hashed_pw = generate_password_hash(password)
        
        repo.update_user_password(email, password)
        session.pop("reset_email", None)
        flash("Password updated successfully!", "success")
        return redirect(url_for("password_reset.password_changed"))

    # return render_template("reset_password.html")

