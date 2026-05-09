import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, User } from '../App';
import { Mic, MicOff, Send, Volume2, VolumeX, Loader2, Cpu, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export function AiAssistant({ language, user }: { language: Language, user: User }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: `System initialized. Welcome, ${user.name}. I am your Advanced AI Academic Assistant. How can I assist you today?` }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true); // Auto-read AI responses if true
  const chatEndRef = useRef<HTMLDivElement>(null);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text: string) => {
    if (!voiceMode || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<Language, string> = {
      'English': 'en-IN', 'Hindi': 'hi-IN', 'Odia': 'or-IN', 'Telugu': 'te-IN', 'Bengali': 'bn-IN'
    };
    utterance.lang = langMap[language];
    window.speechSynthesis.speak(utterance);
  };

  const handleSendChat = async (text: string = inputText) => {
    if (!text.trim()) return;
    
    setInputText('');
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }

    const newMessages = [...messages, { id: Date.now().toString(), role: 'user' as const, text }];
    setMessages(newMessages);
    setIsTyping(true);

    // Simulate AI network delay
    await new Promise(r => setTimeout(r, 1200));

    const lowerMsg = text.toLowerCase();
    let responseText = `I am processing your query regarding "${text}". Please contact administration for specific details not currently in my database.`;

    // Simulated Database Fetching
    const DB = {
      attendance: {
        'COA': { name: 'Computer Organization & Architecture', present: 42, total: 50 },
        'OS': { name: 'Operating System', present: 30, total: 40 },
        'AR': { name: 'Automata and Formal Languages', present: 35, total: 40 },
        'CI': { name: 'Computational Intelligence', present: 20, total: 30 },
        'DM': { name: 'Discrete Mathematics', present: 45, total: 50 },
        'JAVA': { name: 'Java Programming', present: 38, total: 40 },
        'OB': { name: 'Organizational Behaviour', present: 18, total: 30 }, // 60%
      },
      exams: [
         { sub: 'COA', date: '21st May, 10:00 AM' },
         { sub: 'JAVA', date: '24th May, 10:00 AM' },
         { sub: 'CI', date: '28th May, 10:00 AM' }
      ],
      cgpa: 8.4,
      internships: [
         'AI Engineering at TechNova', 'Java Backend Dev at SyncSoft', 'Data Intern at DataCore'
      ],
      notices: [
         'Annual tech fest "Nirmana 2026" starts next month.',
         'Tomorrow is a declared holiday for a local festival.'
      ],
      sports: [
         'Inter-College Sports Meet "Athletica" is starting next week.',
         'Registrations for Cricket and Football are open until Friday.'
      ],
      assignments: [
         { sub: 'JAVA', title: 'Spring Boot API', status: 'Pending', due: '15th May' },
         { sub: 'DM', title: 'Graph Theory Problem Set', status: 'Submitted', due: '10th May' }
      ]
    };

    // Advanced Intent Detection (Simulated NLP & Fuzzy Matching)
    const isCGPA = lowerMsg.includes('cgpa') || lowerMsg.includes('result') || lowerMsg.includes('marks') || lowerMsg.includes('grade') || lowerMsg.includes('kete');
    const isExam = lowerMsg.includes('exam') || lowerMsg.includes('schedule') || lowerMsg.includes('test') || lowerMsg.includes('date') || lowerMsg.includes('routine') || lowerMsg.includes('kab');
    const isInternship = lowerMsg.includes('internship') || lowerMsg.includes('placement') || lowerMsg.includes('job') || lowerMsg.includes('career');
    const isSport = lowerMsg.includes('sport') || lowerMsg.includes('cricket') || lowerMsg.includes('football') || lowerMsg.includes('athlet');
    const isNotice = lowerMsg.includes('notice') || lowerMsg.includes('event') || lowerMsg.includes('notification') || lowerMsg.includes('holiday');
    const isAssignment = lowerMsg.includes('assignment') || lowerMsg.includes('task') || lowerMsg.includes('homework');

    // Find subject abbreviation or name
    const matchedSubject = Object.keys(DB.attendance).find(code => {
       const sub = DB.attendance[code as keyof typeof DB.attendance];
       return new RegExp(`\\b${code.toLowerCase()}\\b`).test(lowerMsg) || 
              lowerMsg.includes(sub.name.toLowerCase());
    });
    
    const isOverall = lowerMsg.includes('overall') || lowerMsg.includes('all ') || lowerMsg.includes('subject-wise') || lowerMsg.includes('sabka');
    
    // Default to attendance if subject is mentioned without other intents, or if attendance words are used
    const isAttendance = lowerMsg.includes('attendance') || lowerMsg.includes('present') || lowerMsg.includes('attending') || lowerMsg.includes('absent') || lowerMsg.includes('attndnc') || (!isCGPA && !isExam && !isAssignment && !isNotice && !isInternship && !isSport && !!matchedSubject);

    if (isAttendance || (matchedSubject && !isExam && !isAssignment)) {
        if (matchedSubject && !isOverall) {
            const info = DB.attendance[matchedSubject as keyof typeof DB.attendance];
            const pct = Math.round((info.present / info.total) * 100);
            
            responseText = `${info.name}\n\nAttendance Details:\n- Present Classes: ${info.present}\n- Total Classes: ${info.total}\n- Attendance Percentage: ${pct}%\n\nStatus:\n`;
            
            if (pct < 75) {
                responseText += `⚠️ Low Attendance Warning! Your attendance is below 75%.`;
            } else {
                responseText += `✅ Good Attendance`;
            }
        } else {
            // Overall / Default
            let details = "Overall Attendance:\n\n";
            let warnings = "";
            for (const [code, info] of Object.entries(DB.attendance)) {
                const pct = Math.round((info.present / info.total) * 100);
                details += `- ${code} → ${pct}%\n`;
                if (pct < 75) {
                    warnings += `\n⚠️ Low Attendance Warning: Your attendance in ${code} is below 75%.`;
                }
            }
            responseText = details + (warnings ? "\n" + warnings : "");
        }
    } else if (isAssignment) {
       responseText = `Your Assignment Status:\n\n` + DB.assignments.map(a => `• ${a.sub}: ${a.title}\n  Due: ${a.due} | Status: ${a.status === 'Pending' ? '❌ Pending' : '✅ Submitted'}`).join('\n\n');
    } else if (isCGPA) {
       responseText = `Your overall CGPA up to the previous semester is ${DB.cgpa}.\n\n✅ You have successfully cleared all previous subjects. Keep up the excellent work, ${user.name}!`;
    } else if (isExam) {
       if (matchedSubject) {
           const exam = DB.exams.find(e => e.sub === matchedSubject);
           if (exam) {
               responseText = `The exam for ${exam.sub} is scheduled on ${exam.date}.`;
           } else {
               responseText = `No upcoming exam scheduled for ${matchedSubject} at the moment.`;
           }
       } else {
           responseText = `Here is your upcoming Exam Routine:\n\n` + 
                          DB.exams.map(e => `• ${e.sub}: ${e.date}`).join('\n') + 
                          `\n\nPlease check the portal for seating arrangements 2 days prior to the exams.`;
       }
    } else if (isInternship) {
       responseText = `I found ${DB.internships.length} active internship opportunities matching your CSE profile:\n\n` + 
                      DB.internships.map(i => `• ${i}`).join('\n') +
                      `\n\nWould you like me to send the application forms to your email?`;
    } else if (isSport) {
       responseText = `${DB.sports[0]}\n\n${DB.sports[1]}`;
    } else if (isNotice) {
       responseText = `Latest Notifications:\n\n` + DB.notices.map(n => `🔔 ${n}`).join('\n');
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
       responseText = `Hello ${user.name}! I am your intelligent academic assistant. You can ask me to "show OS attendance", "check CGPA", or "tell me about upcoming exams". How can I help?`;
    } else {
       responseText = `I am still learning! Could you please ask about specific subjects (like COA, OS, JAVA attendance), exams, CGPA, or notices to get detailed information?`;
    }

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: responseText }]);
    setIsTyping(false);
    speakText(responseText);
  };

  const toggleListening = () => {
    if (!recognition) {
       alert("Speech recognition is not supported in this browser.");
       return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    const langMap: Record<Language, string> = {
      'English': 'en-IN', 'Hindi': 'hi-IN', 'Odia': 'or-IN', 'Telugu': 'te-IN', 'Bengali': 'bn-IN'
    };
    recognition.lang = langMap[language];
    recognition.continuous = false; // Stop after one phrase to simulate AI chat flow
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        handleSendChat(finalTranscript);
      }
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.start();
    setIsListening(true);
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognition && isListening) recognition.stop();
    };
  }, []);

  const suggestions = [
    "Show My Attendance",
    "Check CGPA",
    "Upcoming Exams",
    "Assignment Status",
    "Internship Updates",
    "Sports & Notices"
  ];

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col pt-4">
      {/* Header area */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500 rounded-full blur-md opacity-40 animate-pulse"></div>
            <div className="w-12 h-12 bg-navy-800 rounded-full border border-primary-500/50 flex items-center justify-center relative z-10">
              <Cpu className="w-6 h-6 text-primary-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
              Nexus AI <Sparkles className="w-4 h-4 text-primary-400" />
            </h1>
            <p className="text-xs text-primary-300 uppercase tracking-widest font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Online • Multi-lingual Core Active
            </p>
          </div>
        </div>
        <button
          onClick={() => setVoiceMode(!voiceMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg ${
            voiceMode 
              ? 'bg-primary-500 text-white shadow-primary-500/25 border border-primary-400/50' 
              : 'bg-navy-800 text-gray-400 border border-white/10 hover:text-white'
          }`}
        >
          {voiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          Voice Feedback: {voiceMode ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="flex-1 glass-card rounded-3xl border border-white/10 flex flex-col overflow-hidden relative shadow-2xl shadow-black/50">
        {/* Futuristic Background overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/10 via-navy-900/0 to-navy-900/50"></div>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-navy-800 border-2 border-primary-500/30 text-primary-400'
                }`}>
                  {msg.role === 'user' ? user.name.charAt(0).toUpperCase() : <Cpu className="w-4 h-4" />}
                </div>

                <div className={`max-w-[75%] rounded-2xl p-4 shadow-xl ${
                  msg.role === 'user' 
                    ? 'bg-primary-500 text-white rounded-tr-sm' 
                    : 'bg-navy-800/80 backdrop-blur-md text-gray-200 border border-white/5 rounded-tl-sm'
                }`}>
                  <p className="text-[15px] leading-relaxed tracking-wide">{msg.text}</p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 flex-row"
              >
                <div className="w-8 h-8 rounded-full bg-navy-800 border-2 border-primary-500/30 text-primary-400 flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="bg-navy-800/80 backdrop-blur-md rounded-2xl p-4 rounded-tl-sm border border-white/5 flex gap-2 items-center shadow-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} className="h-4" />
        </div>
        
        {/* Input Area */}
        <div className="bg-navy-900/90 backdrop-blur-xl border-t border-white/10 flex flex-col relative z-20">
          <div className="px-6 pt-5 pb-3 flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(suggestion)}
                className="px-4 py-2 bg-navy-800 hover:bg-primary-500/20 text-gray-300 hover:text-white text-sm rounded-xl border border-white/5 hover:border-primary-500/30 transition-all flex-shrink-0 font-medium"
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          <div className="px-6 pb-6 pt-2 flex items-center gap-3">
            <button 
              onClick={toggleListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl flex-shrink-0 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/50' 
                  : 'bg-navy-800 border border-white/10 text-primary-400 hover:bg-navy-700 hover:border-primary-500/50'
              }`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              placeholder={isListening ? `Listening in ${language}...` : `Type your query in ${language}...`}
              className="flex-1 bg-navy-800/50 border border-white/10 focus:border-primary-500/50 px-5 py-4 rounded-2xl text-white placeholder-gray-500 outline-none transition-all"
            />
            
            <button 
              onClick={() => handleSendChat()}
              disabled={!inputText.trim() || isTyping}
              className="w-14 h-14 bg-primary-500 hover:bg-primary-400 disabled:bg-navy-800 disabled:text-gray-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-primary-500/25 flex-shrink-0"
            >
              <Send className="w-6 h-6 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
