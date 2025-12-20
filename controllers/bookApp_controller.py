# from flask import Blueprint, render_template, request, redirect, url_for
# from models.appointment_model import Appointment
# from repositories.appointment_repository import AppointmentRepository

# appointment_bp = Blueprint("appointment", __name__)

# repo = AppointmentRepository()

# @appointment_bp.route("/", methods=["GET", "POST"])
# def book_appointment():
#     if request.method == "POST":
#         appointment = Appointment(
#             name=request.form.get("name"),
#             phone=request.form.get("phone"),
#             email=request.form.get("email"),
#             date=request.form.get("date"),
#             time=request.form.get("time"),
#             area=request.form.get("area"),
#             city=request.form.get("city"),
#             state=request.form.get("state"),
#             post_code=request.form.get("post_code")
#         )

#         repo.add_appointment(appointment)
#         return redirect(url_for("appointment.success"))

#     return render_template("form/Form.html")


# @appointment_bp.route("/success")
# def success():
#     return "<h2>Appointment Booked Successfully ✅</h2>"


from flask import Blueprint, render_template, request, redirect, url_for
from models.bookApp import Appointment
from repositories.bookApp_repository import AppointmentRepository

appointment_bp = Blueprint("appointment", __name__)
repo = AppointmentRepository()

@appointment_bp.route("/", methods=["GET", "POST"])
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


@appointment_bp.route("/success")
def success():
    return "<h2>Appointment booked successfully ✅</h2>"
