import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api/client';
import { Code, Server, Layers, Loader2, ArrowRight } from 'lucide-react';

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
  const [selectedExp, setSelectedExp] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    if (!selectedRole || !selectedExp || !selectedTime) return;
    setLoading(true);
    
    try {
      const onboardingData = { 
        targetRole: selectedRole.id,
        experienceLevel: selectedExp.id,
        dailyTime: selectedTime.id
      };

      const res = await apiClient.put('/users/me/onboarding', onboardingData);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        Object.assign(user, onboardingData);
        localStorage.setItem('user', JSON.stringify(user));
      }

      navigate('/dashboard');
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Progress Header */}
        <div className="flex items-center justify-center space-x-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                ${step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-indigo-600' : 'bg-gray-800'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* STEP 1: ROLE */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">What is your target path?</h1>
              <p className="text-gray-400">Select the role you want to master.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {ROLES.map((role) => (
                <div 
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`relative cursor-pointer rounded-2xl p-6 border transition-all 
                    ${selectedRole?.id === role.id 
                      ? 'bg-gray-800 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-600'}`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${role.color}`}></div>
                  <div className="mt-4 mb-4 p-3 bg-gray-950 rounded-xl inline-block">{role.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-400">{role.description}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                disabled={!selectedRole}
                onClick={() => setStep(2)}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center space-x-2 disabled:opacity-50 transition-all"
              >
                <span>Continue to Experience</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Your Starting Point</h1>
              <p className="text-gray-400">Be honest—it helps us set realistic target scores.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {EXPERIENCE_LEVELS.map((exp) => (
                <div 
                  key={exp.id}
                  onClick={() => setSelectedExp(exp)}
                  className={`cursor-pointer rounded-2xl p-8 border text-center transition-all 
                    ${selectedExp?.id === exp.id 
                      ? 'bg-gray-800 border-indigo-500' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
                >
                  <h3 className="text-xl font-bold mb-2">{exp.title}</h3>
                  <p className="text-sm text-gray-400">{exp.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setStep(1)} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl">Back</button>
              <button
                disabled={!selectedExp}
                onClick={() => setStep(3)}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center space-x-2 disabled:opacity-50 transition-all"
              >
                <span>Define Commitment</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TIME */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Daily Commitment</h1>
              <p className="text-gray-400">How much time can you realistically invest every day?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {TIME_OPTIONS.map((time) => (
                <div 
                  key={time.id}
                  onClick={() => setSelectedTime(time)}
                  className={`cursor-pointer rounded-2xl p-6 border text-center transition-all 
                    ${selectedTime?.id === time.id 
                      ? 'bg-gray-800 border-indigo-500' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
                >
                  <h3 className="text-lg font-bold mb-1">{time.title}</h3>
                  <p className="text-xs text-gray-500">{time.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setStep(2)} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl">Back</button>
              <button
                disabled={!selectedTime || loading}
                onClick={handleComplete}
                className="px-12 py-4 bg-white text-gray-950 font-bold rounded-xl text-lg flex items-center space-x-3 hover:bg-gray-200 transition-colors disabled:opacity-50"
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
