import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '../App';
import { GraduationCap } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const allowedUsers = [
  { name: 'subham sahu', rollNo: '202456010' },
  { name: 'ananda sagar dakua', rollNo: '202456008' },
  { name: 'k sumit dora', rollNo: '202456031' },
  { name: 'kartik jena', rollNo: '202456035' },
  { name: 'drishika parida', rollNo: '202457012' },
  { name: 'p. alisha dora', rollNo: '202457029' },
  { name: 's.sradha suman', rollNo: '202457028' },
  { name: 'anisha swain', rollNo: '202457637' },
  { name: 'prabhasini', rollNo: '202457643' }
];

export function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [regNo, setRegNo] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setRegNo('');
    setRollNo('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setPhone('');
    setDepartment('');
    setSemester('');
    setPhoto(null);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // In a real application, this would post to the Flask backend
    // Simulate successful registration by adding to allowed users
    const newStudent = {
      name: name.trim().toLowerCase(),
      rollNo: rollNo.trim()
    };

    if (!allowedUsers.find(u => u.rollNo === newStudent.rollNo)) {
      allowedUsers.push(newStudent);
    }

    setSuccessMsg('Registration successful! You can now login.');
    setTimeout(() => {
      setIsLogin(true);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      if (regNo && rollNo && name && password) {
        try {
          const baseUrl = import.meta.env.VITE_FLASK_URL || 'http://localhost:5000';
          const response = await fetch(`${baseUrl}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ regNo, rollNo, full_name: name, password })
          });
          
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          
          const data = await response.json();
          if (data.status === 'success') {
            const displayUser = {
              name: data.user.name,
              rollNo: data.user.rollNo,
              regNo: data.user.regNo,
              email: data.user.email,
              phone: data.user.phone,
              department: data.user.department,
              semester: data.user.semester,
              photoUrl: data.user.photoUrl ? `${baseUrl}${data.user.photoUrl}` : undefined
            };
            onLogin(displayUser);
          } else {
            setError(data.message || 'Invalid credentials.');
          }
        } catch (err: any) {
          console.error("Login fetch error:", err);
          // Fallback to offline simulation if no backend 
          const isAllowed = allowedUsers.some(
            user => user.name.toLowerCase() === name.trim().toLowerCase() && 
                    user.rollNo === rollNo.trim()
          );

          if (isAllowed) {
            const displayUser = allowedUsers.find(
              user => user.name.toLowerCase() === name.trim().toLowerCase() && user.rollNo === rollNo.trim()
            );
            onLogin({ 
              regNo, 
              rollNo: displayUser!.rollNo, 
              name: displayUser!.name.replace(/\b\w/g, l => l.toUpperCase()) // basic title case
            });
          } else {
            setError('Invalid credentials. Server unreachable and user not in offline cache.');
          }
        }
      }
    } else {
      handleRegisterSubmit(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-navy-900">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 rounded-2xl z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-navy-800 rounded-xl flex items-center justify-center border border-primary-500/20 mb-4 shadow-lg shadow-primary-500/25">
            <GraduationCap className="text-primary-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide text-center">NIST UNIVERSITY</h1>
          <p className="text-primary-500 text-sm font-medium tracking-widest uppercase mt-1">{isLogin ? 'Student Portal' : 'Student Registration'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm p-3 rounded-lg text-center">
              {successMsg}
            </div>
          )}

          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required={!isLogin}
                  placeholder="student@nist.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm text-white"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  required={!isLogin}
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm text-white"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Department / Branch</label>
                <input
                  type="text"
                  required={!isLogin}
                  placeholder="e.g. CSE"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm text-white"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Year / Semester</label>
                <input
                  type="text"
                  required={!isLogin}
                  placeholder="e.g. 3rd Sem"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Registration Number</label>
            <input
              type="text"
              required
              placeholder="e.g. 2201234"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-white"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Roll Number</label>
            <input
              type="text"
              required
              placeholder="e.g. CSE-22-101"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-white"
            />
          </div>

          <div className={!isLogin ? "grid grid-cols-2 gap-4" : ""}>
            <div className={!isLogin ? "col-span-2 sm:col-span-1" : ""}>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm text-white"
              />
            </div>
            
            {!isLogin && (
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  required={!isLogin}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm text-white"
                />
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider text-left">Upload Student Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500/20 file:text-primary-500 hover:file:bg-primary-500/30"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-400 text-white font-bold py-3.5 rounded-xl mt-6 transition-colors duration-200 outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-navy-900 shadow-lg shadow-primary-500/25"
          >
            {isLogin ? 'Sign In' : 'Register & Save Face Data'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? "New Student? " : "Already registered? "}
            <button 
              onClick={handleToggle}
              className="text-primary-500 hover:text-primary-400 font-semibold transition-colors"
            >
              {isLogin ? "Register Here" : "Login Here"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
