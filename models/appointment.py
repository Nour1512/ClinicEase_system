class Appointment:

    def __init__(
        self,
        Appointment_ID,
        patient_id,
        patient_name,
        doctor_id,
        doctor_name,
        Appointment_Date,
        Status,
        Payment_Status,
        Notes
    ):
        self.appointment_id = Appointment_ID
        self.patient_id = patient_id
        self.patient_name = patient_name
        self.doctor_id = doctor_id
        self.doctor_name = doctor_name
        self.appointment_date = Appointment_Date
        self.status = Status
        self.payment_status = Payment_Status
        self.notes = Notes

    @staticmethod
    def from_dict(data):
        return Appointment(
            data["Appointment_ID"],
            data["patient_id"],
            data["patient_name"],
            data["doctor_id"],
            data["doctor_name"],
            data["Appointment_Date"],
            data["Status"],
            data["Payment_Status"],
            data["Notes"]
        )
