import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api/client';
import { Trophy, Target, TrendingUp, Zap, Briefcase, Award, Star, Loader2, ArrowRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

const PublicProfile = () => {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get(`/users/profile/${username}`);
        setData(res.data.data);
      } catch (err) {
        setError("Profile not found or is private.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="text-red-400 text-xl font-bold mb-4">{error}</div>
      <a href="/" className="text-indigo-400 hover:underline">Back to Home</a>
    </div>
  );

  const { user, careerScore, topSkills, activeProjects } = data;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-indigo-500/30">
      {/* Premium Header */}
      <div className="relative h-64 bg-gradient-to-br from-indigo-900 via-gray-900 to-gray-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent"></div>
        
        <div className="max-w-5xl mx-auto px-6 h-full flex flex-col justify-end pb-12 relative z-10">
          <div className="flex items-end gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-gray-950">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="pb-2">
              <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-2">
                {user.username}
              </h1>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                  {user.targetRole}
                </span>
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-500/30">
                  {user.experienceLevel}
                </span>
                {user.streakCount > 0 && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest border border-orange-500/30 flex items-center gap-1">
                    <Zap size={12} fill="currentColor" />
                    {user.streakCount} Day Streak
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Readiness Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-1">Market Readiness</h2>
                <p className="text-gray-400 text-xs">Based on real-world engineering patterns</p>
              </div>
              <div className="text-right">
                <span className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  {careerScore.readinessPercentage}%
                </span>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height={192}>
                <LineChart data={careerScore.history}>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#6366f1' }}
                    activeDot={{ r: 8, fill: '#818cf8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topSkills.map((skill, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-800 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-tight">{skill.skillId.name}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{skill.level}</p>
                  </div>
                </div>
                <span className="text-xl font-black italic text-gray-700 group-hover:text-indigo-500 transition-colors">
                  {skill.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
             <h3 className="text-xl font-black italic text-white mb-4 leading-tight">
               Want to hire {user.username}?
             </h3>
             <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
               Verified expertise in {user.targetRole} roles with a momentum of +{careerScore.weeklyGain} points this week.
             </p>
             <button className="w-full py-4 bg-white text-gray-950 font-black rounded-2xl shadow-xl shadow-black/20 hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2">
               CONTACT CANDIDATE
               <ArrowRight size={18} />
             </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Briefcase size={12} />
              Active Projects
            </h4>
            <div className="space-y-4">
              {activeProjects.map((project, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm font-bold text-white line-clamp-1">{project.title}</p>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {activeProjects.length === 0 && (
                <p className="text-xs text-gray-600 italic">No public projects in progress.</p>
              )}
            </div>
          </div>

          {/* Verified Proof (V2.4) */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star size={12} fill="currentColor" />
              Verified Proof of Skill
            </h4>
            <div className="space-y-4">
              {data.completedProjects?.map((project, i) => (
                <div key={i} className="p-3 bg-gray-950 rounded-xl border border-emerald-500/10">
                  <p className="text-xs font-bold text-white mb-1">{project.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400">+{project.verificationResults?.scoreGain} PTS</span>
                    <span className="text-[10px] text-gray-600">•</span>
                    <span className="text-[10px] text-gray-500">{new Date(project.completedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {(!data.completedProjects || data.completedProjects.length === 0) && (
                <p className="text-xs text-gray-600 italic">No verified projects completed yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
