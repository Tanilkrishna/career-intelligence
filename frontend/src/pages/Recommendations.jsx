import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api/client';
import { useToast } from '../components/ToastProvider';
import { Sparkles, ArrowRight, Loader2, Target, Briefcase, Zap, Clock } from 'lucide-react';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await apiClient.get('/career/recommendations');
        setRecommendations(res.data.data);
      } catch (err) {
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  const handleStartProject = async (project) => {
    try {
      await apiClient.post('/career/projects/start', {
        title: project.title,
        description: project.description,
        difficulty: project.difficulty,
        skills: project.skills,
        predictedGain: project.predictedGain
      });
      toast.success(`Project "${project.title}" started! Check your dashboard.`);
      navigate('/dashboard');
    } catch (err) {
      toast.error("Failed to start project. Try again.");
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

  if (error) return <div className="text-red-400">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-900/40">
            <Sparkles className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white mb-1">Career GPS: Next Best Moves</h2>
            <p className="text-gray-400 font-medium max-w-md">Strategically curated projects to eliminate detected technical gaps and maximize your hiring score.</p>
          </div>
        </div>
        <div className="bg-gray-900/50 px-6 py-4 rounded-2xl border border-gray-700/50 flex flex-col items-center">
           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Precision Rating</span>
           <span className="text-2xl font-black text-white italic">High</span>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center text-gray-400 py-12 bg-gray-900/40 border border-gray-700 border-dashed rounded-3xl">
          No recommendations right now. Run an evaluation to detect technical gaps!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl hover:border-indigo-500 transition-all flex flex-col h-full relative overflow-hidden group">
              {/* Identity Variation Badge */}
              <div className="absolute top-0 left-0 bg-indigo-600 text-white px-4 py-1.5 rounded-br-2xl text-[10px] font-black uppercase tracking-widest shadow-lg z-10">
                 {rec.learningStyle || '⚡ Technical Mastery'}
              </div>

              <div className="flex justify-between items-start mb-6 mt-4">
                 <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors leading-tight">{rec.title}</h3>
                 <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">{rec.outcomes?.readinessGain || '+15%'}</span>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Readiness</p>
                 </div>
              </div>

              <div className="bg-indigo-900/20 p-4 rounded-2xl border border-indigo-500/20 mb-6">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">The "Why"</p>
                 <p className="text-sm text-gray-200 leading-relaxed italic">
                    "{rec.whyRecommended}"
                 </p>
              </div>

              <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-500/20 mb-8">
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Hiring Risk (Loss Aversion)</p>
                 <p className="text-sm text-gray-300 leading-relaxed font-medium">
                    {rec.lossAversion}
                 </p>
              </div>

              {/* Outcomes Row */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Time to Market</p>
                    <p className="text-sm font-bold text-white italic">{rec.outcomes?.timeReduction || '-2 weeks'}</p>
                 </div>
                 <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Difficulty</p>
                    <p className="text-sm font-bold text-white">{rec.difficulty}</p>
                 </div>
              </div>

              <button 
                onClick={() => handleStartProject(rec)}
                className="mt-auto w-full py-5 bg-white text-gray-950 hover:bg-indigo-600 hover:text-white font-black rounded-2xl flex items-center justify-center space-x-3 transition-all active:scale-95 shadow-xl shadow-black/40 group/btn uppercase tracking-tighter"
              >
                <span>Initialize Project & Lock-in Gain</span>
                <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
