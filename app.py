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


from flask import Flask, redirect
from flask_mail import Mail, Message
from dotenv import load_dotenv
import os
from authlib.integrations.flask_client import OAuth
from controllers.reset_pass_controller import password_reset_bp
from controllers.auth_controller import auth_bp
from controllers.settings_controler import settings_bp
from controllers.payment_controllers import payment_bp  # This payment_bp should match the blueprint name
# from repositories.patient_repository import init_db

# Load environment variables
load_dotenv()

app = Flask(__name__)
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

# Home redirect
@app.route("/")
def home():
    return redirect("/login")

if __name__ == "__main__":
    app.run(debug=True)
