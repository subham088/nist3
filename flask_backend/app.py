import os
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import cv2

app = Flask(__name__)
CORS(app)

from ai_assistant import ai_blueprint
app.register_blueprint(ai_blueprint)

# Configuration
UPLOAD_FOLDER = 'dataset'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
DB_FILE = 'students.db'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    # Create table for students
    c.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            reg_no TEXT NOT NULL UNIQUE,
            roll_no TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            department TEXT NOT NULL,
            semester TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            photo_path TEXT NOT NULL
        )
    ''')
    
    # Create table for subjects
    c.execute('''
        CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            semester TEXT NOT NULL,
            department TEXT NOT NULL
        )
    ''')
    
    # Create table for attendance
    c.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_roll TEXT NOT NULL,
            subject_code TEXT NOT NULL,
            attendance_percentage INTEGER NOT NULL,
            FOREIGN KEY (student_roll) REFERENCES students(roll_no),
            FOREIGN KEY (subject_code) REFERENCES subjects(code)
        )
    ''')
    
    # Create table for exams
    c.execute('''
        CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_code TEXT NOT NULL,
            exam_date TEXT NOT NULL,
            exam_time TEXT NOT NULL,
            room TEXT NOT NULL,
            FOREIGN KEY (subject_code) REFERENCES subjects(code)
        )
    ''')

    # Create table for internships
    c.execute('''
        CREATE TABLE IF NOT EXISTS internships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            department TEXT NOT NULL,
            apply_link TEXT NOT NULL
        )
    ''')

    # Create table for sports_updates
    c.execute('''
        CREATE TABLE IF NOT EXISTS sports_updates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL,
            sport TEXT NOT NULL,
            event_date TEXT NOT NULL,
            description TEXT
        )
    ''')
    
    # Create table for notices
    c.execute('''
        CREATE TABLE IF NOT EXISTS notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            date_issued TEXT NOT NULL,
            content TEXT NOT NULL
        )
    ''')

    # Create table for assignments
    c.execute('''
        CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_roll TEXT NOT NULL,
            subject_code TEXT NOT NULL,
            title TEXT NOT NULL,
            status TEXT NOT NULL,
            due_date TEXT NOT NULL,
            FOREIGN KEY (student_roll) REFERENCES students(roll_no),
            FOREIGN KEY (subject_code) REFERENCES subjects(code)
        )
    ''')

    # Insert sample data if empty
    c.execute("SELECT COUNT(*) FROM subjects")
    if c.fetchone()[0] == 0:
        c.executemany("INSERT INTO subjects (code, name, semester, department) VALUES (?, ?, ?, ?)", [
            ('COA', 'Computer Organization and Architecture', '3rd Sem', 'CSE'),
            ('OS', 'Operating System', '3rd Sem', 'CSE'),
            ('AR', 'Automata and Formal Languages', '3rd Sem', 'CSE'),
            ('CI', 'Computational Intelligence', '3rd Sem', 'CSE'),
            ('DM', 'Discrete Mathematics', '3rd Sem', 'CSE'),
            ('JAVA', 'Java Programming', '3rd Sem', 'CSE'),
            ('OB', 'Organizational Behaviour', '3rd Sem', 'CSE'),
        ])
        
        # Sample attendance for allowed students
        c.executemany("INSERT INTO attendance (student_roll, subject_code, attendance_percentage) VALUES (?, ?, ?)", [
            ('202456010', 'COA', 84), ('202456010', 'OS', 75), ('202456010', 'AR', 87), ('202456010', 'CI', 66), ('202456010', 'DM', 90), ('202456010', 'JAVA', 95), ('202456010', 'OB', 60),
            ('202456008', 'COA', 70), ('202456008', 'OS', 80), ('202456008', 'AR', 85), ('202456008', 'CI', 78), ('202456008', 'DM', 90),
            ('202457637', 'COA', 88), ('202457637', 'OS', 92), ('202457637', 'AR', 85), ('202457637', 'CI', 89), ('202457637', 'DM', 91), ('202457637', 'JAVA', 96), ('202457637', 'OB', 80),
            ('202457643', 'COA', 82), ('202457643', 'OS', 79), ('202457643', 'AR', 88), ('202457643', 'CI', 85), ('202457643', 'DM', 80), ('202457643', 'JAVA', 92), ('202457643', 'OB', 86),
        ])
    
    conn.commit()
    conn.close()

init_db()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/register', methods=['POST'])
def register_student():
    photo = request.files.get('photo')
    
    # Get form data
    full_name = request.form.get('full_name')
    reg_no = request.form.get('reg_no')
    roll_no = request.form.get('roll_no')
    email = request.form.get('email')
    phone = request.form.get('phone')
    department = request.form.get('department')
    semester = request.form.get('semester')
    password = request.form.get('password')
    
    # Basic validation
    if not all([full_name, reg_no, roll_no, email, phone, department, semester, password]):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400
        
    photo_path = ""
    if photo and photo.filename and allowed_file(photo.filename):
        # Secure the filename and save
        filename = secure_filename(f"{roll_no}_{full_name}.jpg")
        photo_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        photo.save(photo_path)
        
        # Optionally, one could verify if a face exists in the uploaded image using OpenCV
        img = cv2.imread(photo_path)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            os.remove(photo_path)
            return jsonify({'status': 'error', 'message': 'No face detected in the photo. Please upload a clear photo.'}), 400
            
    hashed_password = generate_password_hash(password)
    
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('''
            INSERT INTO students (full_name, reg_no, roll_no, email, phone, department, semester, password_hash, photo_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (full_name, reg_no, roll_no, email, phone, department, semester, hashed_password, photo_path))
        conn.commit()
    except sqlite3.IntegrityError as e:
        conn.close()
        if photo_path and os.path.exists(photo_path):
            os.remove(photo_path) # Remove photo if db insert fails
        if 'email' in str(e):
            return jsonify({'status': 'error', 'message': 'Email already registered'}), 400
        elif 'roll_no' in str(e):
            return jsonify({'status': 'error', 'message': 'Roll Number already registered'}), 400
        elif 'reg_no' in str(e):
            return jsonify({'status': 'error', 'message': 'Registration Number already registered'}), 400
        else:
             return jsonify({'status': 'error', 'message': 'Database constraint error: ' + str(e)}), 400
    except Exception as e:
        conn.close()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()
            
    message = 'Registration successful. Face data captured.' if photo_path else 'Registration successful.'
    return jsonify({'status': 'success', 'message': message})
    
@app.route('/api/login', methods=['POST'])
def login_student():
    data = request.get_json()
    reg_no = data.get('reg_no')
    roll_no = data.get('roll_no')
    password = data.get('password')
    full_name = data.get('full_name') # for additional verification
    
    if not all([reg_no, roll_no, password]):
        return jsonify({'status': 'error', 'message': 'Missing credentials'}), 400
        
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT password_hash, full_name, email, phone, department, semester, photo_path FROM students WHERE reg_no = ? AND roll_no = ?", (reg_no, roll_no))
    user = c.fetchone()
    conn.close()
    
    if user:
        stored_hash = user[0]
        stored_name = user[1]
        email = user[2]
        phone = user[3]
        department = user[4]
        semester = user[5]
        photo_path = user[6]
        
        if check_password_hash(stored_hash, password):
            if full_name and full_name.lower() != stored_name.lower():
                return jsonify({'status': 'error', 'message': 'Invalid Name provided'}), 400
                
            photo_url = None
            if photo_path and os.path.exists(photo_path):
                 photo_url = f"/dataset/{os.path.basename(photo_path)}"
                 
            return jsonify({
                'status': 'success', 
                'message': 'Login successful',
                'user': {
                    'name': stored_name,
                    'roll_no': roll_no,
                    'reg_no': reg_no,
                    'email': email,
                    'phone': phone,
                    'department': department,
                    'semester': semester,
                    'photoUrl': photo_url
                }
            })
            
    return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

from flask import send_from_directory

@app.route('/dataset/<path:filename>')
def serve_dataset(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/profile/update', methods=['POST'])
def update_profile():
    roll_no = request.form.get('roll_no')
    if not roll_no:
         return jsonify({'status': 'error', 'message': 'Roll number required'}), 400
         
    # Fetch existing
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT * FROM students WHERE roll_no = ?", (roll_no,))
    student = c.fetchone()
    
    if not student:
        conn.close()
        return jsonify({'status': 'error', 'message': 'Student not found'}), 404
        
    full_name = request.form.get('full_name') or student[1]
    email = request.form.get('email') or student[4]
    phone = request.form.get('phone') or student[5]
    department = request.form.get('department') or student[6]
    semester = request.form.get('semester') or student[7]
    photo_path = student[9]
    
    photo = request.files.get('photo')
    if photo and photo.filename and allowed_file(photo.filename):
        filename = secure_filename(f"{roll_no}_{full_name.replace(' ', '_')}.jpg")
        new_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        photo.save(new_path)
        photo_path = new_path
        
    try:
        c.execute('''
            UPDATE students
            SET full_name = ?, email = ?, phone = ?, department = ?, semester = ?, photo_path = ?
            WHERE roll_no = ?
        ''', (full_name, email, phone, department, semester, photo_path, roll_no))
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    
    conn.close()
    
    photo_url = None
    if photo_path:
         photo_url = f"/dataset/{os.path.basename(photo_path)}"
         
    return jsonify({
        'status': 'success', 
        'message': 'Profile updated successfully',
        'photo_url': photo_url
    })

@app.route('/api/students', methods=['GET'])
def get_students():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    c.execute("SELECT full_name, roll_no, department, semester, photo_path FROM students")
    students = c.fetchall()
    
    result = []
    for s in students:
        roll_no = s[1]
        c.execute("SELECT AVG(attendance_percentage) FROM attendance WHERE student_roll = ?", (roll_no,))
        avg_att = c.fetchone()[0] or 85 # Default mock
        
        result.append({
            'name': s[0],
            'roll_no': roll_no,
            'department': s[2],
            'semester': s[3],
            'photo_url': f'/dataset/{os.path.basename(s[4])}' if s[4] else None,
            'cgpa': 8.5, # mock
            'attendance': round(avg_att, 1)
        })
        
    conn.close()
    
    # If no students in DB yet, return mock list so UI doesn't look empty and includes the newly requested names
    if not result:
        result = [
            { 'name': 'Subham Sahu', 'roll_no': '202456010', 'department': 'Computer Science', 'semester': '6th Semester', 'photo_url': None, 'cgpa': 8.5, 'attendance': 85 },
            { 'name': 'Ananda Sagar Dakua', 'roll_no': '202456008', 'department': 'Information Technology', 'semester': '6th Semester', 'photo_url': None, 'cgpa': 9.1, 'attendance': 92 },
            { 'name': 'Anisha Swain', 'roll_no': '202457637', 'department': 'Computer Science', 'semester': '6th Semester', 'photo_url': None, 'cgpa': 8.8, 'attendance': 90 },
            { 'name': 'Prabhasini', 'roll_no': '202457643', 'department': 'Electronics', 'semester': '6th Semester', 'photo_url': None, 'cgpa': 8.2, 'attendance': 85 },
        ]
        
    return jsonify({'status': 'success', 'students': result})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
