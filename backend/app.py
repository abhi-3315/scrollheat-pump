from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app) # to connect the html

def get_db():
    conn = sqlite3.connect('kirloskar.db')
    conn.row_factory = sqlite3.Row
    return conn

# Database 
with get_db() as conn:
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            display_name TEXT,
            phone TEXT,
            status TEXT DEFAULT 'pending'
        )
    ''')
    conn.commit()

# 1. User Register API
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    try:
        with get_db() as conn:
            conn.execute("INSERT INTO users (email, password, display_name, phone, status) VALUES (?, ?, ?, ?, 'pending')",
                         (data['email'], data['password'], data['display_name'], data['phone']))
            conn.commit()
        return jsonify({"success": True, "message": "Registration successful! Wait for admin approval."})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Email already exists!"})

# 2. User Login API
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    with get_db() as conn:
        user = conn.execute("SELECT * FROM users WHERE email=? AND password=?", (data['email'], data['password'])).fetchone()
        
    if user:
        if user['status'] != 'active':
            return jsonify({"success": False, "message": "Access Denied: Account is PENDING or REVOKED by Admin."})
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid Email or Password"})

# 3. Admin: Get All Users
@app.route('/admin/users', methods=['GET'])
def get_users():
    with get_db() as conn:
        users = conn.execute("SELECT * FROM users").fetchall()
    return jsonify([dict(u) for u in users])

# 4. Admin: Add New User Directly
@app.route('/admin/add_user', methods=['POST'])
def admin_add_user():
    data = request.json
    try:
        with get_db() as conn:
            conn.execute("INSERT INTO users (email, password, display_name, phone, status) VALUES (?, ?, ?, ?, 'active')",
                         (data['email'], data['password'], data['display_name'], data['phone']))
            conn.commit()
        return jsonify({"success": True})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "User already exists"})

# 5. Admin: Change Status
@app.route('/admin/users/status', methods=['POST'])
def update_status():
    data = request.json
    with get_db() as conn:
        conn.execute("UPDATE users SET status=? WHERE email=?", (data['status'], data['email']))
        conn.commit()
    return jsonify({"success": True})

# 6. Admin: Delete User
@app.route('/admin/users/<email>', methods=['DELETE'])
def delete_user(email):
    with get_db() as conn:
        conn.execute("DELETE FROM users WHERE email=?", (email,))
        conn.commit()
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
