from dataclasses import dataclass
from datetime import datetime

@dataclass
class Notification:
    notification_id: int
    patient_id: int
    doctor_id: int
    type: str
    message: str
    date_sent: datetime
    status: str

    def to_dict(self):
        return {
            "notification_id": self.notification_id,
            "type": self.type,
            "message": self.message,
            "date_sent": self.date_sent.strftime("%b %d, %Y %I:%M %p"),
            "status": self.status
        }
