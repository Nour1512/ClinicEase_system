CREATE TABLE Patients (
    patient_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(50) NOT NULL,
    medical_history NVARCHAR(MAX),
    address NVARCHAR(255),
    dob DATE,
    gender NVARCHAR(10),
    emergency_contact NVARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);


CREATE TABLE doctors (
    doctor_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(50) NOT NULL,
    specialty NVARCHAR(100),
    phone NVARCHAR(15),
    availability NVARCHAR(50),
    rating FLOAT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Admins (
    Admin_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);



CREATE TABLE Appointment (
	patient_id int not null,
	doctor_id int not null,
    Appointment_ID INT IDENTITY(1,1) PRIMARY KEY,
	FOREIGN key (patient_id) REFERENCES Patients (patient_id),
	FOREIGN key (doctor_id) REFERENCES doctors (doctor_id),
    Appointment_Date DATETIME NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    Payment_Status NVARCHAR(10) NOT NULL DEFAULT 'Unpaid',
    Notes NVARCHAR(MAX),
);


create table Prescription(
	prescription_id int IDENTITY(1,1) primary key,
	patient_id int not null,
	doctor_id int not null,
	Admin_id int not null,
	date_issued DATE NOT NULL,
    medication_list NVARCHAR(MAX),
    instructions NVARCHAR(MAX),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
	FOREIGN key (patient_id) REFERENCES Patients(patient_id)
	on delete cascade
	on update cascade ,
	FOREIGN key (doctor_id) REFERENCES doctors(doctor_id)
	on delete cascade
	on update cascade ,
	FOREIGN key (Admin_id) REFERENCES Admins(Admin_id)
	on update cascade
	on delete cascade ,
	);

create table feedback(
	Feedback_ID int IDENTITY(1,1) primary key,
	patient_id int not null,
	doctor_id int not null,
	rating int not null CHECK (rating >= 1 AND rating <= 5),
	comment NVARCHAR(MAX),
	feedback_date DATE NULL,
	FOREIGN key (patient_id) REFERENCES Patients(patient_id)
	on delete cascade
	on update cascade ,
	FOREIGN key (doctor_id) REFERENCES doctors(doctor_id)
	on delete cascade
	on update cascade ,
	);

create table payment(
	payment_id int IDENTITY(1,1) primary key,
	Appointment_ID int not null,
	FOREIGN key (Appointment_ID) REFERENCES Appointment (Appointment_ID)
	on delete cascade
	on update cascade ,
	Amount DECIMAL(10,2) NOT NULL,
    Payment_Method VARCHAR(50) NOT NULL,
    Payment_Date DATETIME NOT NULL,
    Status VARCHAR(20) NOT NULL
        CHECK (Status IN ('Success', 'Failed', 'Pending'))
);

create table Inventory(
	Medicine_ID int IDENTITY(1,1) primary key,
	medicine_name varchar(100),
	quality int not null,
	price  DECIMAL  (10,2) NOT NULL,
	Expiry_Date date not null,
	Supplier varchar (300),
	);


create table lab_test(
	Test_ID int identity(1,1) primary key,
	patient_id int not null,
	doctor_id int not null,
	FOREIGN key (patient_id) REFERENCES Patients(patient_id)
	on delete cascade
	on update cascade ,
	FOREIGN key (doctor_id) REFERENCES doctors(doctor_id)
	on delete cascade
	on update cascade ,
	test_type varchar (100),
	result varchar(MAX),
	Test_date DATE not null,
);

create table Chatbot (
	Chatbot_ID int identity(1,1) primary key,
	patient_id int not null,
	FOREIGN key (patient_id) REFERENCES Patients(patient_id)
	on delete cascade
	on update cascade ,
	Question  VARCHAR(max),
	Response  VARCHAR (max),
	Date_Time DateTime NOT NULL,
	Intent varchar(100),
	Status NVARCHAR(20) NOT NULL
    CHECK (Status IN ('Resolved', 'Pending')),
);

create table Notifications(
	 Notification_ID  int identity(1,1) primary key,
	 patient_id int not null,
	FOREIGN key (patient_id) REFERENCES Patients(patient_id)
	on delete cascade
	on update cascade ,
	doctor_id int not null,
	FOREIGN key (doctor_id) REFERENCES doctors(doctor_id)
	on delete cascade
	on update cascade ,
	type varchar(100),
	Message varchar(100),
	Date_Sent DateTime not null,
	Status NVARCHAR(20) NOT NULL
		CHECK (Status IN ('Resolved', 'Pending')),
	);

CREATE TABLE password_resets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(100) NOT NULL,
    reset_code NVARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BIT DEFAULT 0
);


create table pharmacy(
	Medicine_ID int IDENTITY(1,1) primary key,
	Medicine_Name varchar(100),
	Quantity int not null,
	price  DECIMAL  (10,2) NOT NULL,
	Expiry_Date date not null,
	Supplier varchar (300),
	);


CREATE TABLE Services (
    Service_ID INT IDENTITY(1,1) PRIMARY KEY,
    Service_Name NVARCHAR(100) NOT NULL,
    Department NVARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Status NVARCHAR(10) NOT NULL CHECK (Status IN ('Active', 'Inactive')),
    Created_At DATETIME DEFAULT GETDATE()
);
CREATE TABLE patients_details (
    patient_id INT PRIMARY KEY,
    blood_type VARCHAR(5),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
	medical_record text,
    current_medications TEXT,
    medical_notes TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
	    CONSTRAINT FK_Patients_Details_Patients
        FOREIGN KEY (patient_id)
        REFERENCES Patients(patient_id)
        ON DELETE CASCADE
);

INSERT INTO Services (Service_Name, Department, Price, Status)
VALUES
('General Consultation', 'General Medicine', 200, 'Active'),
('Dental Cleaning', 'Dentistry', 180, 'Active'),
('Eye Checkup', 'Ophthalmology', 150, 'Active'),
('X-Ray', 'Radiology', 80, 'Inactive'),
('Physiotherapy Session', 'Physiotherapy', 130, 'Active');


INSERT INTO Admins (full_name, email, password)
VALUES
('Sarah Ahmed', 'sarah.admin@clinicease.com', 'Admin123'),
('Mohamed Ali', 'mohamed.admin@clinicease.com', 'SecurePass1'),
('Lina Mostafa', 'lina.admin@clinicease.com', 'AdminPass45');


INSERT INTO Patients (full_name, email, password, medical_history, address, dob, gender, emergency_contact)
VALUES
('Nour Hassan', 'nour.hassan@example.com', 'Patient123', 'Diabetes Type 2', 'Cairo, Nasr City', '1998-04-12', 'Female', '01012345678'),
('Ahmed Samir', 'ahmed.samir@example.com', 'Patient456', 'No major conditions', 'Giza, Dokki', '1995-07-23', 'Male', '01098765432'),
('Mona Mostafa', 'mona.mostafa@example.com', 'Patient789', 'Asthma', 'Alexandria, Smouha', '2000-11-02', 'Female', '01122334455'),
('Karim Adel', 'karim.adel@example.com', 'Pass1234', 'Hypertension', 'Cairo, Maadi', '1987-02-15', 'Male', '01055667788'),
('Rana Ibrahim', 'rana.ibrahim@example.com', 'Rana@2025', 'Allergic to Penicillin', 'Cairo, Heliopolis', '1999-09-09', 'Female', '01066778899');


INSERT INTO doctors (full_name, email, password, specialty, phone, availability, rating)
VALUES
('Dr. Omar Khaled', 'omar.khaled@clinic.com', 'DocPass123', 'Cardiology', '01011223344', 'Mon-Wed 10AM-4PM', 4.8),
('Dr. Sara Youssef', 'sara.youssef@clinic.com', 'Heart2024', 'Dermatology', '01022334455', 'Sun-Tue 12PM-6PM', 4.5),
('Dr. Hany Farid', 'hany.farid@clinic.com', 'Doctor123', 'Orthopedics', '01133445566', 'Sat-Mon 9AM-3PM', 4.7),
('Dr. Manal Reda', 'manal.reda@clinic.com', 'Manal789', 'Pediatrics', '01044556677', 'Tue-Thu 11AM-5PM', 4.9),
('Dr. Karim Nabil', 'karim.nabil@clinic.com', 'Karim123', 'Neurology', '01055667788', 'Wed-Fri 1PM-7PM', 4.6);

INSERT INTO pharmacy (medicine_name, Quantity, price, Expiry_Date, Supplier)
VALUES
('Paracetamol 500mg', 120, 18.50, '2026-03-12', 'PharmaLife Co.'),
('Ibuprofen 200mg', 90, 25.00, '2025-11-30', 'MedSupply Egypt'),
('Amoxicillin 500mg', 50, 45.75, '2026-06-20', 'Global Pharma'),
('Cetirizine 10mg', 150, 12.00, '2027-02-15', 'AllergyCare Ltd.'),
('Omeprazole 20mg', 80, 30.25, '2025-09-01', 'DigestWell Supplies'),
('Vitamin C 1000mg', 200, 22.90, '2027-01-10', 'NutriHealth Industries'),
('Aspirin 81mg', 110, 14.30, '2026-05-08', 'CardioMed Inc.'),
('Azithromycin 250mg', 60, 58.00, '2025-12-01', 'BioMed International'),
('Insulin Pen Cartridge', 40, 120.50, '2025-07-18', 'LifeCare Medical'),
('Metformin 850mg', 95, 33.40, '2026-10-04', 'Diabetes Pharma');