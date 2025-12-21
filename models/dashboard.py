# models/dashboard.py
from dataclasses import dataclass
from datetime import datetime

@dataclass
class DashboardStats:
    """Model for dashboard statistics"""
    total_patients: int = 0
    total_doctors: int = 0
    total_appointments: int = 0
    total_revenue: float = 0.0
    pending_appointments: int = 0
    today_appointments: int = 0
    available_doctors: int = 0
    low_stock_medicines: int = 0

@dataclass
class RecentActivity:
    """Model for recent activities"""
    activity_id: int
    user_type: str
    user_name: str
    action: str
    timestamp: datetime
    icon: str = ""

@dataclass
class AppointmentSummary:
    """Model for appointment summaries"""
    appointment_id: int
    patient_name: str
    doctor_name: str
    appointment_date: datetime
    status: str
    time_slot: str = ""