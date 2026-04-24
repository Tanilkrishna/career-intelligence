import React, { useState, useEffect } from 'react';
import apiClient from '../services/api/client';
import { Sparkles, ArrowRight, Loader2, Target, Briefcase } from 'lucide-react';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

  if (error) return <div className="text-red-400">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
          <Sparkles className="text-white" size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Recommended Action Plan</h2>
          <p className="text-gray-400">Build these projects to eliminate your technical gaps and increase your score.</p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          No recommendations right now. Run an evaluation to detect gaps!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg hover:border-indigo-500 transition-colors flex flex-col h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full transition-transform group-hover:scale-110 blur-xl"></div>
              
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide
                  ${rec.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' : 
                    rec.difficulty === 'Intermediate' ? 'bg-blue-500/10 text-blue-400' : 
                    'bg-orange-500/10 text-orange-400'}`}>
                  {rec.difficulty}
                </span>
                
                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide
                  ${rec.recommendationType === 'Career Accelerator' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                    rec.recommendationType === 'Perfect Challenge' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                  {rec.recommendationType}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{rec.title}</h3>
              <div className="flex items-center space-x-2 mb-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span>Timeline:</span>
                <span className="text-indigo-400">~{rec.estimatedDays} days</span>
              </div>
              <p className="text-sm text-gray-400 mb-6 flex-1 leading-relaxed">{rec.description}</p>
              
              <div className="space-y-4">
                {/* Impact Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-400 uppercase tracking-tighter">Strategic Impact</span>
                    <span className="text-indigo-400">{rec.impactScore}%</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-1.5 border border-gray-700/50">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, rec.impactScore)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                  <Target className="text-rose-400 mt-0.5 shrink-0" size={16} />
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">The "Why":</span> {rec.reason}
                  </p>
                </div>

                <div className="flex items-center space-x-2 bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30">
                  <Sparkles className="text-indigo-400 shrink-0" size={16} />
                  <p className="text-sm text-indigo-200">
                    Targeted Growth: <span className="font-bold text-indigo-400">+{rec.predictedGain} points</span>
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {rec.skills.map((skill, i) => (
                    <span key={i} className="text-xs font-medium px-2 py-1 bg-gray-700/50 text-gray-300 rounded-md border border-gray-600/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button className="mt-6 w-full py-3 bg-gray-700 hover:bg-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg shadow-black/20">
                <span>Engage Project</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
