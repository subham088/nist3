import React, { useState, useEffect } from 'react';
import { Search, MapPin, Book, Trophy, ExternalLink, GraduationCap, Phone, Mail } from 'lucide-react';

interface Student {
  name: string;
  roll_no: string;
  department: string;
  semester: string;
  photo_url: string | null;
  cgpa: number;
  attendance: number;
}

export function Directory() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const baseUrl = import.meta.env.VITE_FLASK_URL || 'http://localhost:5000';
        const res = await fetch(`${baseUrl}/api/students`);
        const data = await res.json();
        if (data.status === 'success') {
          setStudents(data.students.map((s: any) => ({
             ...s,
             photo_url: s.photo_url ? `${baseUrl}${s.photo_url}` : null
          })));
        }
      } catch (err) {
        console.error("Failed to load students", err);
        // Fallback simulated data for ui preview
        setStudents([
          { name: 'Subham Sahu', roll_no: '202456010', department: 'Computer Science', semester: '6th Semester', photo_url: null, cgpa: 8.5, attendance: 85 },
          { name: 'Ananda Sagar Dakua', roll_no: '202456008', department: 'Information Technology', semester: '6th Semester', photo_url: null, cgpa: 9.1, attendance: 92 },
          { name: 'K Sumit Dora', roll_no: '202456031', department: 'Computer Science', semester: '6th Semester', photo_url: null, cgpa: 8.4, attendance: 88 },
          { name: 'Kartik Jena', roll_no: '202456035', department: 'Mechanical Engineering', semester: '6th Semester', photo_url: null, cgpa: 8.7, attendance: 82 },
          { name: 'Drishika Parida', roll_no: '202457012', department: 'Electronics', semester: '6th Semester', photo_url: null, cgpa: 8.3, attendance: 76 },
          { name: 'P. Alisha Dora', roll_no: '202457029', department: 'Information Technology', semester: '6th Semester', photo_url: null, cgpa: 8.9, attendance: 90 },
          { name: 'S. Sradha Suman', roll_no: '202457028', department: 'Civil Engineering', semester: '6th Semester', photo_url: null, cgpa: 8.6, attendance: 89 },
          { name: 'Anisha Swain', roll_no: '202457637', department: 'Computer Science', semester: '6th Semester', photo_url: null, cgpa: 8.8, attendance: 90 },
          { name: 'Prabhasini Nayak', roll_no: '202457643', department: 'Electronics', semester: '6th Semester', photo_url: null, cgpa: 8.2, attendance: 85 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.roll_no.includes(search) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Student Directory</h1>
          <p className="text-gray-400 mt-1">Connect with your peers across departments.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-800 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student, idx) => (
            <div key={idx} className="glass-card rounded-2xl border border-white/5 overflow-hidden group hover:border-primary-500/30 transition-all duration-300">
              <div className="h-20 bg-gradient-to-r from-navy-800 to-navy-700 relative">
                 <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:16px_16px]" />
              </div>
              
              <div className="px-6 pb-6 relative pt-0">
                <div className="w-20 h-20 mx-auto rounded-full border-4 border-navy-900 bg-navy-800 -mt-10 overflow-hidden flex items-center justify-center z-10 relative mb-3 shadow-xl">
                  {student.photo_url ? (
                    <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}&backgroundColor=0A1628&textColor=F5A623`} alt="Avatar" className="w-full h-full" />
                  )}
                </div>
                
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">{student.name}</h3>
                  <p className="text-sm text-gray-400 font-mono">{student.roll_no}</p>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <GraduationCap className="w-4 h-4 text-primary-500 shrink-0" />
                    <span className="truncate">{student.department}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Book className="w-4 h-4 text-accent shrink-0" />
                    <span>{student.semester}</span>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">CGPA</p>
                    <p className="font-bold text-white text-lg">{student.cgpa}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Attendance</p>
                    <p className={`font-bold text-lg ${student.attendance >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                      {student.attendance}%
                    </p>
                  </div>
                </div>
                
                <div className="mt-5 flex gap-2 w-full">
                   <button className="flex-1 py-2 rounded-lg bg-navy-800 hover:bg-primary-500/20 text-gray-300 hover:text-white border border-white/5 hover:border-primary-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                     <Mail className="w-4 h-4" /> Message
                   </button>
                </div>
              </div>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-400">No students found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
