# tests/test_models.py
from datetime import datetime
from models.admin import Admin
from models.doctor import Doctor
from models.patient import Patient
from models.payment import Payment
from models.Pharmacy import Pharmacy

# Test Admin model
def test_admin_creation():
    admin = Admin(
        admin_id=1,
        full_name="Super Admin",
        email="admin@clinic.com",
        password="secure123"
    )
    assert admin.admin_id == 1
    assert admin.full_name == "Super Admin"
    assert admin.email == "admin@clinic.com"
    assert admin.password == "secure123"

# Test Doctor model
def test_doctor_creation():
    doctor = Doctor(
        doctor_id=101,
        full_name="Dr. Emily Chen",
        email="emily@clinic.com",
        password="docpass",
        specialty="Pediatrics",
        phone="555-0198",
        availability="Mon-Fri 9AM-5PM",
        rating=4.9
    )
    assert doctor.doctor_id == 101
    assert doctor.specialty == "Pediatrics"
    assert doctor.rating == 4.9

# Test Patient model
def test_patient_creation():
    patient = Patient(
        patient_id=201,
        full_name="Michael Rodriguez",
        email="michael@patient.com",
        medical_history="Asthma",
        address="456 Oak St",
        dob="1988-07-22",
        gender="Male",
        emergency_contact="Maria Rodriguez (555-0123)",
        password="patient123"
    )
    assert patient.patient_id == 201
    assert patient.medical_history == "Asthma"
    assert patient.dob == "1988-07-22"

# Test Payment model
def test_payment_creation():
    payment_date = datetime(2025, 12, 18, 10, 30)
    payment = Payment(
        payment_id=301,
        appointment_id=45,
        amount=150.0,
        payment_method="Credit Card",
        payment_date=payment_date,
        status="Success"
    )
    assert payment.payment_id == 301
    assert payment.amount == 150.0
    assert payment.status == "Success"
    assert payment.payment_date == payment_date

# Test Pharmacy model
def test_pharmacy_creation():
    medicine = Pharmacy(
        Medicine_id=501,
        MedicineName="Paracetamol 500mg",
        Quantity=150,
        price=2.99,
        ExpiryDate="2027-12-31",
        supplier="MediSupply Inc"
    )
    assert medicine.Medicine_id == 501
    assert medicine.MedicineName == "Paracetamol 500mg"
    assert medicine.Quantity == 150
    assert medicine.price == 2.99

# Test model from_dict (example with Patient)
def test_patient_from_dict():
    data = {
        'patient_id': 202,
        'full_name': "Sarah Johnson",
        'email': "sarah@patient.com",
        'medical_history': "None",
        'address': "789 Pine Ave",
        'dob': "1995-03-14",
        'gender': "Female",
        'emergency_contact': "Tom Johnson (555-0456)",
        'password': "sarahpass",
        'last_appointment': None
    }
    patient = Patient.from_dict(data)
    assert patient.patient_id == 202
    assert patient.full_name == "Sarah Johnson"
    assert patient.emergency_contact == "Tom Johnson (555-0456)"