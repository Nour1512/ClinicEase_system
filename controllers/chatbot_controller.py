from flask import Blueprint, render_template, request, redirect, url_for, session , current_app , flash
chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route("/chatbot-page")
def chatbot():
    return render_template("user/chatbot.html")