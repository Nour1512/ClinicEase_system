# from flask import Flask
# from controllers.user_controller import user_bp
# from controllers.product_controller import product_bp
# app = Flask(__name__)
# app.register_blueprint(user_bp)
# app.register_blueprint(product_bp)

# @app.route("/")
# def home():
#     return """
# <h1>Welcome to ShopEase</h1>
# <p><a href='/users'>View Users</a></p>
# <p><a href='/products'>View Products</a></p>
#     """

# if __name__ == "__main__":
#     app.run(debug=True)


from flask import Flask, redirect , session
from flask_mail import Mail, Message
from dotenv import load_dotenv
import os
from controllers.invoice_controller import InvoiceController
from controllers.service_controller import service_bp
# from controllers.invoice_controller import invoice_bp
from authlib.integrations.flask_client import OAuth
from controllers.reset_pass_controller import password_reset_bp
from controllers.auth_controller import auth_bp
from controllers.settings_controler import settings_bp
from controllers.payment_controllers import payment_bp  # This payment_bp should match the blueprint name
# from repositories.patient_repository import init_db

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.url_map.strict_slashes = False
app.secret_key = os.getenv("SECRET_KEY")

# Initialize DB
# init_db()

# oauth = OAuth(app)





oauth = OAuth(app)

# Register Google
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    access_token_url='https://oauth2.googleapis.com/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    client_kwargs={'scope': 'openid email profile'}
)

# Facebook
oauth.register(
    name='facebook',
    client_id=os.getenv("FACEBOOK_CLIENT_ID"),
    client_secret=os.getenv("FACEBOOK_CLIENT_SECRET"),
    access_token_url='https://graph.facebook.com/oauth/access_token',
    authorize_url='https://www.facebook.com/v18.0/dialog/oauth',
    client_kwargs={'scope': 'email public_profile'},
    userinfo_endpoint='https://graph.facebook.com/me?fields=id,name,email'
)

# LinkedIn
oauth.register(
    name='linkedin',
    client_id=os.getenv("LINKEDIN_CLIENT_ID"),
    client_secret=os.getenv("LINKEDIN_CLIENT_SECRET"),
    access_token_url='https://www.linkedin.com/oauth/v2/accessToken',
    authorize_url='https://www.linkedin.com/oauth/v2/authorization',
    client_kwargs={'scope': 'r_liteprofile r_emailaddress'}
)


# Email setup
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("EMAIL_USER")
app.config['MAIL_PASSWORD'] = os.getenv("EMAIL_APP_PASSWORD")
mail = Mail(app)  # Make mail available globally


# Make OAuth available inside other files
app.oauth = oauth

# Register blueprints
app.register_blueprint(settings_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(password_reset_bp)
from controllers.pharamcy_controler import pharmacy_bp
app.register_blueprint(pharmacy_bp)
app.register_blueprint(payment_bp, url_prefix='/')  # Add url_prefix if needed
app.register_blueprint(service_bp , url_prefix='/services')
from controllers.chatbot_controller import chatbot_bp
app.register_blueprint(chatbot_bp)
from controllers.invoice_controller import invoice_bp
app.register_blueprint(invoice_bp)
# from controllers.service_controller import service_bp
# app.register_blueprint(service_bp)
from controllers.patient_controller import patients_bp
app.register_blueprint(patients_bp)

from controllers.admin_controller import admin_feedback_bp
from controllers.doctor_controller import doctor_bp
from controllers.notifications_controller import notification_bp
app.register_blueprint(notification_bp)

app.register_blueprint(admin_feedback_bp, url_prefix='/admin_feedbacks')
app.register_blueprint(doctor_bp)

from controllers.a_feedback_controller import feedback_bp
app.register_blueprint(feedback_bp , url_prefix='/admin_feedbacks')

from controllers.appointment_controller import appointment_bp

# Register with URL prefix → makes routes available at /appointments
app.register_blueprint(appointment_bp, url_prefix='/appointments')

from datetime import datetime, timedelta

@app.template_filter('datetimeformat')
def datetimeformat(value):
    if value == 'tomorrow':
        return (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    return value

from controllers.bookApp_controller import bookApp_bp

# Register with proper URL prefix

from controllers.dashboard_controller import dashboard_bp
app.register_blueprint(dashboard_bp)
app.register_blueprint(bookApp_bp, url_prefix='/book')

from controllers.ms_controller import ms_blueprint
app.register_blueprint(ms_blueprint)

from controllers.patients_details_controller import patients_details_bp
app.register_blueprint(patients_details_bp, url_prefix='/patients_details')


from controllers.profile_completion_controller import get_missing_profile_fields
# This automatically passes missing_profile_fields to every template without needing to pass it manually in each route.
@app.context_processor
def inject_profile_status():
    """
    Makes 'missing_profile_fields' available in ALL templates
    """
    return dict(missing_profile_fields=get_missing_profile_fields())


@app.context_processor
def inject_user_info():
    return {
        'current_role': session.get('role'),
        'user_id': session.get('user_id')
    }



# Home redirect
@app.route("/")
def home():
    return redirect("/login")

if __name__ == "__main__":
    app.run(debug=True)

