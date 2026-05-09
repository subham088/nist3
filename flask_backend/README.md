# Face Recognition Attendance System - Flask Backend

This is the Python Flask backend for the Student Registration Portal and Face Recognition System.

## Features
- **SQLite Database** (`students.db`) automatically created.
- **Passwords** are securely hashed using `werkzeug.security`.
- **Face Images** are validated using OpenCV to ensure a face is present, and saved to the `dataset` folder.
- **Duplicate checking** for Roll Number, Registration Number, and Email.
- **Authentication Routes** for Login and Registration.

## Requirements
- Python 3.8+
- Requirements listed in `requirements.txt`

## Setup

1. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the Flask server:
   ```bash
   python app.py
   ```

The server will start on `http://127.0.0.1:5000`.

## API Endpoints

### 1. Register a Student
**POST** `/api/register`
Accepts `multipart/form-data`.
- `full_name`: Text
- `reg_no`: Text
- `roll_no`: Text
- `email`: Text
- `phone`: Text
- `department`: Text
- `semester`: Text
- `password`: Text
- `photo`: File (Image)

### 2. Login a Student
**POST** `/api/login`
Accepts `application/json`.
- `full_name`: Text
- `reg_no`: Text
- `roll_no`: Text
- `password`: Text

## Frontend Integration
The React frontend handles the registration UI. In production, you would modify the `/src/components/Login.tsx` file's `handleRegisterSubmit` function to send a `FormData` POST request to `http://127.0.0.1:5000/api/register` instead of using the simulated success message.
