from flask import Blueprint, render_template, request, redirect, url_for, session , current_app , flash
from authlib.integrations.flask_client import OAuth
import os
from repositories.patient_repository import PatientRepository
from repositories.doctor_repository import DoctorRepository
from repositories.admin_repository import AdminRepository

auth_bp = Blueprint("auth", __name__)

# OAuth setup
# oauth = OAuth()
# google = oauth.register(
#     name='google',
#     client_id=os.getenv("GOOGLE_CLIENT_ID"),
#     client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
#     access_token_url='https://oauth2.googleapis.com/token',
#     authorize_url='https://accounts.google.com/o/oauth2/auth',
#     client_kwargs={'scope': 'openid email profile'}
# )

patient_repo = PatientRepository()
doctor_repo = DoctorRepository()
admin_repo = AdminRepository()



def find_user_by_email(email):
    user = patient_repo.get_patient_by_email(email)
    if user:
        return user, "patient"
    user = doctor_repo.get_doctor_by_email(email)
    if user:
        return user, "doctor"
    user = admin_repo.get_admin_by_email(email)
    if user:
        return user, "admin"
    return None, None
# ---------- ROUTES ----------
@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        user , role = find_user_by_email(email)
        if user and user.password == password:
            session["user_id"] = user.patient_id if role == "patient" else user.doctor_id if role == "doctor" else user.admin_id
            session["name"] = user.full_name
            session["role"] = role

            # if role == "patient":
            #     return redirect("/patient/dashboard")
            # elif role == "doctor":
            #     return redirect("/doctor/dashboard")
            # elif role == "admin":
            #     return redirect("/admin/dashboard")
            return redirect("/dashboard")
        # user = patient_repo.get_patient_by_email(email)
        # if user and user.password == password:
        #     session["user_id"] = user.patient_id
        #     session["name"] = user.full_name
        #     return redirect("/dashboard")
        else:
            # return "Invalid email or password", 401
            flash("Invalid email or password. Please try again.", "error")
            return redirect(url_for("auth.login"))
    return render_template("user/login.html")

@auth_bp.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        password = request.form["password"]
        existing_user = patient_repo.get_patient_by_email(email)
        if existing_user:
            return "Email already registered", 400
        user = patient_repo.create_patient(name, email, password)
        session["user_id"] = user.patient_id
        session["name"] = user.full_name
        return redirect("/dashboard")
    return render_template("signup.html")


#sha8ala


# @auth_bp.route("/dashboard")
# def dashboard():
#     if "user_id" not in session:
#         return redirect("/login")
    
#     role = session.get("role")
#     if role == "patient":
#         return render_template("pharmacy/pharamcy.html", name=session["name"])
#     elif role == "doctor":
#         # return render_template("user/doctor/doctors.html", name=session["name"])
#         return render_template("user/admin/patients.html", name=session["name"])
#     elif role == "admin":
#         return render_template("user/admin/patients.html", name=session["name"])      # 7ateet patients page badal dashboard
#     else:
#         return redirect("/login")




@auth_bp.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect("/login")
    
    role = session.get("role")
    if role == "patient":
        return redirect("/pharmacy")
    elif role == "doctor":
        # return render_template("user/doctor/doctors.html", name=session["name"])
        return redirect("/patients")
    elif role == "admin":
        return redirect("/admin/patients")      # 7ateet patients page badal dashboard
    else:
        return redirect("/login")





@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect("/login")


@auth_bp.route("/forgot-password")
def forgot_password():
    return render_template("user/forgot_pass.html")


@auth_bp.route("/login-page")
def login_page():
    return render_template("user/login.html")  # or whatever your login template is called

# ---------- GOOGLE OAUTH ----------
@auth_bp.route("/login/google")
def login_google():
    session["oauth_source"] = "login"
    google = current_app.oauth.create_client("google")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    return google.authorize_redirect(redirect_uri)

@auth_bp.route("/signup/google")
def signup_google():
    session["oauth_source"] = "signup"
    google = current_app.oauth.create_client("google")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    return google.authorize_redirect(redirect_uri)

@auth_bp.route("/auth/google/callback")
def google_callback():


    if 'error' in request.args:
        error = request.args.get('error')
        if error == 'access_denied':
            # User clicked "Cancel" in Google prompt
            flash("You cancelled Google sign-in. Please try again or use email/password.", "info")
            # return redirect("/login?error=google_cancelled")
            return redirect("/login")
        else:
            return f"OAuth error: {error}", 400
        
    google = current_app.oauth.create_client("google")
    token = google.authorize_access_token()
    user_info = google.parse_id_token(token)
    name = user_info["name"]
    email = user_info["email"]

    user = patient_repo.get_patient_by_email(email)
    if not user:
        user = patient_repo.create_patient(name, email)

    session["user_id"] = user.patient_id
    session["name"] = user.full_name
    return redirect("/dashboard")
