from flask import Blueprint, render_template, request, redirect, url_for
from models.bookApp import Appointment
from repositories.bookApp_repository import AppointmentRepository

bookApp_bp = Blueprint("appointment", __name__)
repo = AppointmentRepository()

@bookApp_bp.route("/", methods=["GET", "POST"])
def book_appointment():
    if request.method == "POST":
        appointment = Appointment(
            request.form["name"],
            request.form["phone"],
            request.form["email"],
            request.form["date"],
            request.form["time"],
            request.form["area"],
            request.form["city"],
            request.form["state"],
            request.form["post_code"]
        )

        repo.add_appointment(appointment)
        return redirect(url_for("appointment.success"))

    return render_template("form/Form.html")


@bookApp_bp.route("/success")
def success():
    return "<h2>Appointment booked successfully ✅</h2>"
