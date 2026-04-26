import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api/client';
import { useToast } from '../components/ToastProvider';
import { Code, Server, Layers, Loader2, ArrowRight, Check, ChevronRight, Monitor, Database, Cpu, Globe } from 'lucide-react';

const ROLES = [
  {
    id: 'Frontend Engineer',
    title: 'Frontend Engineer',
    icon: <Code size={32} className="text-blue-400" />,
    color: 'from-blue-600 to-cyan-600',
    description: 'Focus on UI/UX, React, and browser performance.'
  },
  {
    id: 'Backend Engineer',
    title: 'Backend Engineer',
    icon: <Server size={32} className="text-emerald-400" />,
    color: 'from-emerald-600 to-teal-600',
    description: 'Focus on APIs, databases, and system architecture.'
  },
  {
    id: 'Fullstack JavaScript Engineer',
    title: 'Fullstack Engineer',
    icon: <Layers size={32} className="text-indigo-400" />,
    color: 'from-indigo-600 to-purple-600',
    description: 'Master both ends of the stack to build complete apps.'
  }
];

const STACKS = [
  {
    id: 'frontend',
    title: 'Frontend (React)',
    icon: <Monitor size={24} className="text-blue-400" />,
    desc: 'React, Vite, CSS Frameworks'
  },
  {
    id: 'backend',
    title: 'Backend (Node)',
    icon: <Database size={24} className="text-emerald-400" />,
    desc: 'Node.js, Express, Databases'
  },
  {
    id: 'fullstack',
    title: 'Fullstack (MERN)',
    icon: <Globe size={24} className="text-indigo-400" />,
    desc: 'MongoDB, Express, React, Node'
  },
  {
    id: 'custom',
    title: 'Custom Stack',
    icon: <Cpu size={24} className="text-rose-400" />,
    desc: 'Choose your specific tools'
  }
];

const TECH_OPTIONS = [
  'React', 'Next.js', 'Node', 'Express', 'MongoDB', 'PostgreSQL', 'TypeScript', 'GraphQL'
];

const EXPERIENCE_LEVELS = [
  { id: 'Beginner', title: 'Beginner', desc: 'Just starting my coding journey' },
  { id: 'Intermediate', title: 'Intermediate', desc: 'Built a few projects already' },
  { id: 'Advanced', title: 'Advanced', desc: 'Experienced with production code' }
];

const TIME_OPTIONS = [
  { id: 15, title: '15 min/day', desc: 'Light pace' },
  { id: 30, title: '30 min/day', desc: 'Standard pace' },
  { id: 60, title: '1 hour/day', desc: 'Focused growth' },
  { id: 120, title: '2+ hours/day', desc: 'Career accelerator' }
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedStack, setSelectedStack] = useState(null);
  const [customTech, setCustomTech] = useState([]);
  const [selectedExp, setSelectedExp] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const toggleTech = (tech) => {
    setCustomTech(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const handleComplete = async () => {
    if (!selectedRole || !selectedStack || !selectedExp || !selectedTime) return;
    setLoading(true);
    
    try {
      const onboardingData = { 
        targetRole: selectedRole.id,
        techStack: selectedStack.id,
        customTechnologies: selectedStack.id === 'custom' ? customTech : [],
        experienceLevel: selectedExp.id,
        dailyTime: selectedTime.id
      };

      await apiClient.put('/users/me/onboarding', onboardingData);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        Object.assign(user, onboardingData);
        localStorage.setItem('user', JSON.stringify(user));
      }

      toast.success("Profile configured! Let's go 🚀");
      navigate('/dashboard');
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      toast.error(err.response?.data?.message || "Failed to save profile");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full">
        {/* Progress Header */}
        <div className="flex items-center justify-center space-x-4 mb-16">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500
                ${step >= s ? 'bg-indigo-600 text-white scale-110 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gray-800 text-gray-500'}`}>
                {s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-1 mx-2 rounded transition-all duration-700 ${step > s ? 'bg-indigo-600' : 'bg-gray-800'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* STEP 1: ROLE */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Choose Your Career Track</h1>
              <p className="text-gray-400 text-lg">Select the role you want to master.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {ROLES.map((role) => (
                <div 
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`relative cursor-pointer rounded-2xl p-6 border transition-all duration-300 group
                    ${selectedRole?.id === role.id 
                      ? 'bg-gray-800 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)]' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-600'}`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${role.color} opacity-0 group-hover:opacity-100 transition-opacity ${selectedRole?.id === role.id ? 'opacity-100' : ''}`}></div>
                  <div className="mt-4 mb-4 p-3 bg-gray-950 rounded-xl inline-block">{role.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{role.description}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                disabled={!selectedRole}
                onClick={() => setStep(2)}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center space-x-2 disabled:opacity-50 transition-all active:scale-95"
              >
                <span>Continue to Stack</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: STACK */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold mb-3">Your Technical Stack</h1>
              <p className="text-gray-400 text-lg">Based on your choice, we will personalize your career path.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {STACKS.map((stack) => (
                <div 
                  key={stack.id}
                  onClick={() => setSelectedStack(stack)}
                  className={`cursor-pointer rounded-xl p-5 border flex items-center space-x-4 transition-all
                    ${selectedStack?.id === stack.id 
                      ? 'bg-indigo-900/20 border-indigo-500 shadow-lg' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
                >
                  <div className="p-2 bg-gray-800 rounded-lg">{stack.icon}</div>
                  <div>
                    <h4 className="font-bold">{stack.title}</h4>
                    <p className="text-xs text-gray-400">{stack.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedStack?.id === 'custom' && (
              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 mb-12 animate-in fade-in zoom-in-95 duration-300">
                <p className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Select your technologies:</p>
                <div className="flex flex-wrap gap-3">
                  {TECH_OPTIONS.map(tech => (
                    <button
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2
                        ${customTech.includes(tech) 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                      {customTech.includes(tech) && <Check size={14} />}
                      <span>{tech}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4 mt-8">
              <button onClick={() => setStep(1)} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all">Back</button>
              <button
                disabled={!selectedStack || (selectedStack.id === 'custom' && customTech.length === 0)}
                onClick={() => setStep(3)}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center space-x-2 disabled:opacity-50 transition-all active:scale-95"
              >
                <span>Continue to Experience</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: EXPERIENCE */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold mb-3">Your Starting Point</h1>
              <p className="text-gray-400 text-lg">Be honest—it helps us set realistic target scores.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {EXPERIENCE_LEVELS.map((exp) => (
                <div 
                  key={exp.id}
                  onClick={() => setSelectedExp(exp)}
                  className={`cursor-pointer rounded-2xl p-8 border text-center transition-all 
                    ${selectedExp?.id === exp.id 
                      ? 'bg-gray-800 border-indigo-500 shadow-xl' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
                >
                  <h3 className="text-xl font-bold mb-2">{exp.title}</h3>
                  <p className="text-sm text-gray-400">{exp.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setStep(2)} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all">Back</button>
              <button
                disabled={!selectedExp}
                onClick={() => setStep(4)}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center space-x-2 disabled:opacity-50 transition-all active:scale-95"
              >
                <span>Final Step</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TIME & SUMMARY */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold mb-3">Daily Commitment</h1>
              <p className="text-gray-400 text-lg">How much time can you realistically invest every day?</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {TIME_OPTIONS.map((time) => (
                <div 
                  key={time.id}
                  onClick={() => setSelectedTime(time)}
                  className={`cursor-pointer rounded-2xl p-6 border text-center transition-all 
                    ${selectedTime?.id === time.id 
                      ? 'bg-indigo-900/20 border-indigo-500 shadow-lg' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
                >
                  <h3 className="text-lg font-bold mb-1">{time.title}</h3>
                  <p className="text-xs text-gray-500">{time.desc}</p>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            {selectedTime && (
              <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 rounded-2xl p-6 mb-12 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-500 rounded-lg"><Check size={20} className="text-white" /></div>
                  <h4 className="text-lg font-bold">Ready to Start</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Target Track</p>
                    <p className="text-sm font-medium">{selectedRole?.title}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Preferred Stack</p>
                    <p className="text-sm font-medium">{selectedStack?.title}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Experience</p>
                    <p className="text-sm font-medium">{selectedExp?.title}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Daily Goal</p>
                    <p className="text-sm font-medium">{selectedTime?.title}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button onClick={() => setStep(3)} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all">Back</button>
              <button
                disabled={!selectedTime || loading}
                onClick={handleComplete}
                className="px-12 py-4 bg-white text-gray-950 font-bold rounded-xl text-lg flex items-center space-x-3 hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <span>Start Your Journey</span>}
                {!loading && <ArrowRight />}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
