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
	DATE DATE not null,
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