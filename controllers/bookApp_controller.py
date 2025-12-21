from flask import Blueprint, render_template, request, redirect, url_for
from models.bookApp import Appointment_Book
from repositories.bookApp_repository import AppointmentRepository_book

bookApp_bp = Blueprint("appointment", __name__)
repo = AppointmentRepository_book()



@bookApp_bp.route("/book-appointment", methods=["GET", "POST"])
def book_appointment():
    if request.method == "POST":
        print("🔍 DEBUG: Form data received:")
        print(f"  Name: {request.form.get('name')}")
        print(f"  Phone: {request.form.get('phone')}")
        print(f"  Email: {request.form.get('email')}")
        print(f"  Date: {request.form.get('date')}")
        print(f"  Time: {request.form.get('time')}")
        print(f"  Formatted Time: {request.form['time'] + ':00'}")
        
        try:
            time_with_seconds = request.form["time"] + ":00"
            appointment = Appointment_Book(
                request.form["name"],
                request.form["phone"],
                request.form["email"],
                request.form["date"],
                time_with_seconds,
                request.form["area"],
                request.form["city"],
                request.form["state"],
                request.form["post_code"]
            )
            
            print("🔍 DEBUG: Appointment object created")
            print(f"  Appointment time: {appointment.time}")
            
            result = repo.add_appointment(appointment)
            print(f"🔍 DEBUG: Repository returned: {result}")
            
            return "<h2>Appointment booked successfully ✅</h2>"
            
        except Exception as e:
            print(f"❌ ERROR in controller: {e}")
            return f"<h2>Error: {e}</h2>", 500

    return render_template("bookAppointment/bookApp.html")
