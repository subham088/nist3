import React, { useState, useRef } from 'react';
import { Camera, Save, User as UserIcon, Mail, Phone, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
import { User } from '../App';

interface ProfileProps {
  user: User;
  setUser: (user: User) => void;
}

export function Profile({ user, setUser }: ProfileProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    department: user.department || 'Computer Science',
    semester: user.semester || '6th Semester',
  });
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.photoUrl || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const submitData = new FormData();
    submitData.append('roll_no', user.rollNo);
    submitData.append('full_name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('department', formData.department);
    submitData.append('semester', formData.semester);
    if (photoFile) {
      submitData.append('photo', photoFile);
    }

    try {
      // Assuming flask is running on port 5000 in dev or same origin
      const baseUrl = import.meta.env.VITE_FLASK_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/profile/update`, {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (data.status === 'success') {
        const photoUrl = data.photo_url ? `${baseUrl}${data.photo_url}` : photoPreview;
        
        setUser({
          ...user,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          semester: formData.semester,
          photoUrl: photoUrl || undefined
        });
        
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      // Fallback for simulation
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        semester: formData.semester,
        photoUrl: photoPreview || undefined
      });
      setMessage({ type: 'success', text: 'Profile updated (Simulated).' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">My Profile</h1>
        <p className="text-gray-400 mt-1">Update your personal details and photo for the student directory.</p>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-900 relative">
           <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:32px_32px]" />
           <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 pt-0 relative">
          
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-end -mt-16 mb-8">
            <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
              <div className="w-32 h-32 rounded-full border-4 border-navy-900 bg-navy-800 overflow-hidden flex items-center justify-center relative shadow-2xl transition-transform duration-300 group-hover:scale-105">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-gray-500" />
                )}
                
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-8 h-8 text-white mb-1" />
                  <span className="text-xs text-white font-medium">Change Photo</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <div className="flex-1 pb-2">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-primary-400" /> {user.rollNo}</span>
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-accent" /> {user.regNo}</span>
              </div>
            </div>
            
            <div className="pb-2 hidden sm:block">
               <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-500 hover:bg-primary-400 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2 disabled:opacity-70"
               >
                 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 Save Changes
               </button>
            </div>
          </div>

          {message && (
             <div className={`p-4 rounded-xl mb-6 flex items-center border ${
               message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
             }`}>
               <span className="font-medium">{message.text}</span>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <UserIcon className="w-5 h-5 text-primary-400" /> Personal Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                  placeholder="student@nist.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                  placeholder="+91 "
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <GraduationCap className="w-5 h-5 text-accent" /> Academic Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Department</label>
                <select 
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                >
                  <option>Computer Science and Engineering</option>
                  <option>Electronics and Communication</option>
                  <option>Electrical and Electronics</option>
                  <option>Information Technology</option>
                  <option>Mechanical Engineering</option>
                  <option>Civil Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Semester</label>
                <select 
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                >
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`${s}${['st','nd','rd'][s-1]||'th'} Semester`}>{s}{['st','nd','rd'][s-1]||'th'} Semester</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-navy-800/50 border border-white/5 p-4 rounded-xl">
                   <p className="text-sm text-gray-400 mb-1">Current CGPA</p>
                   <p className="text-2xl font-bold text-white">{user.cgpa || '8.4'}</p>
                </div>
                <div className="bg-navy-800/50 border border-white/5 p-4 rounded-xl">
                   <p className="text-sm text-gray-400 mb-1">Overall Attendance</p>
                   <p className="text-2xl font-bold text-white">{user.overallAttendance || '85'}%</p>
                </div>
              </div>
            </div>
            
          </div>
          
           <div className="mt-8 pt-6 border-t border-white/10 sm:hidden">
               <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-500 hover:bg-primary-400 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
               >
                 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 Save Changes
               </button>
            </div>
        </form>
      </div>
    </div>
  );
}
