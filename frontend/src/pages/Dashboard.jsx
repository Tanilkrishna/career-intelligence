import React, { useState } from 'react';
import { useCareerData } from '../hooks/useCareerData';
import apiClient from '../services/api/client';
import { Play, Loader2, AlertCircle, Target, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';

const Dashboard = () => {
  const { score, gaps, loading, error, refetch } = useCareerData();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  const runAnalysis = async () => {
    try {
      if (!githubUrl.trim()) return;
      
      setAnalyzing(true);
      setAnalysisProgress(0);
      setAnalysisStep('Initializing pipeline...');

      // 1. Trigger the background job
      const res = await apiClient.post('/analysis/run', { githubUrl });
      const jobId = res.data.data._id;

      // 2. Poll for status
      const poll = setInterval(async () => {
        try {
          const statusRes = await apiClient.get(`/analysis/status/${jobId}`);
          const job = statusRes.data.data;
          
          setAnalysisProgress(job.progress);
          setAnalysisStep(job.currentStep);

          if (job.status === 'completed' || job.status === 'failed') {
            clearInterval(poll);
            setAnalyzing(false);
            if (job.status === 'completed') {
              refetch(); // Refresh the dashboard data
            }
          }
        } catch (e) {
          clearInterval(poll);
          setAnalyzing(false);
        }
      }, 1000); // poll every second

    } catch (err) {
      console.error(err);
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

  // Get user from local storage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Calculate Delta and Format History Data
  let delta = 0;
  let historyData = [];

  if (score?.history && score.history.length > 0) {
    historyData = score.history.map((h, i) => ({
      name: `Run ${i + 1}`,
      date: new Date(h.createdAt).toLocaleDateString(),
      score: h.score
    }));
    
    if (score.history.length > 1) {
      const current = score.history[score.history.length - 1].score;
      const previous = score.history[score.history.length - 2].score;
      delta = current - previous;
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Welcome Back Banner */}
      {user && (
        <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Welcome back, {user.email.split('@')[0]}! 👋</h2>
            <p className="text-indigo-200">Your true potential is unlocked. Keep building.</p>
          </div>
          {delta !== 0 && (
            <div className="bg-indigo-950/50 px-4 py-2 rounded-lg border border-indigo-500/50 flex flex-col items-start md:items-end w-fit">
              <span className="text-sm text-indigo-300">Since last run</span>
              <span className={`text-lg font-bold flex items-center space-x-1 ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {delta > 0 ? '+' : ''}{delta} Points
              </span>
            </div>
          )}
        </div>
      )}

      {/* Career Readiness Tier */}
      {score?.score !== undefined && (
        <div className={`border rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
          score.score > 600 ? 'bg-emerald-950/20 border-emerald-500/30' : 
          score.score > 300 ? 'bg-blue-950/20 border-blue-500/30' : 
          'bg-gray-900/40 border-gray-700'
        }`}>
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl shrink-0 ${
              score.score > 600 ? 'bg-emerald-500/20' : 
              score.score > 300 ? 'bg-blue-500/20' : 
              'bg-gray-700/20'
            }`}>
              <Target className={
                score.score > 600 ? 'text-emerald-400' : 
                score.score > 300 ? 'text-blue-400' : 
                'text-gray-400'
              } size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-0.5">
                {score.score > 850 ? 'Elite / Maintainer Level' :
                 score.score > 600 ? 'High Competence' :
                 score.score > 300 ? 'Mid-Level Readiness' : 'Building Foundations'}
              </h3>
              <p className="text-gray-400 text-sm max-w-md">
                {score.score > 600 ? 'You are ready for Senior-level responsibilities.' :
                 score.score > 300 ? 'Solid foundation. Competitive for Junior-Mid roles.' :
                 'Keep building your core skills to unlock new career opportunities.'}
              </p>
            </div>
          </div>
          <div className={`text-center px-6 py-2 rounded-xl border w-full sm:w-auto ${
            score.score > 600 ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' : 
            score.score > 300 ? 'bg-blue-950/40 border-blue-500/20 text-blue-400' : 
            'bg-gray-900 border-gray-700 text-gray-400'
          }`}>
            <span className="block text-xs uppercase font-semibold mb-0.5">Profile Grade</span>
            <span className="text-2xl font-bold">
              {score.score > 850 ? 'A+' :
               score.score > 700 ? 'A' :
               score.score > 550 ? 'B+' :
               score.score > 400 ? 'B' :
               score.score > 250 ? 'C+' : 'C'}
            </span>
          </div>
        </div>
      )}

      {/* Top Banner / Run Analysis */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">Target: {user?.targetRole || 'Fullstack Engineer'}</h3>
          <p className="text-gray-400 text-sm lg:text-base">Keep your profile updated by running the latest AST evaluation against your GitHub.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <input 
            type="text" 
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="GitHub Username"
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 flex-1 lg:w-64"
            disabled={analyzing}
          />
          <button 
            onClick={runAnalysis}
            disabled={analyzing || !githubUrl.trim()}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-3 rounded-lg font-semibold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 shrink-0"
          >
            {analyzing ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
            <span>{analyzing ? 'Evaluating...' : 'Run Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar (Visible only when running) */}
      {analyzing && (
        <div className="bg-gray-800 rounded-xl p-6 border border-blue-500/30 shadow-lg shadow-blue-900/10">
          <div className="flex justify-between text-sm mb-2 text-blue-300 font-medium">
            <span>{analysisStep}</span>
            <span>{analysisProgress}%</span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-3 border border-gray-700">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-400 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${analysisProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center space-x-3 text-red-400">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Chart */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Career Score Radial */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-tr-full blur-3xl"></div>
            
            <h4 className="text-gray-400 font-medium mb-8">Overall Readiness Score</h4>
            
            {/* Simple Radial visualization using SVG */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="text-gray-700 stroke-current" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="50" cy="50" r="40" 
                  className="text-blue-500 stroke-current drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out" 
                  strokeWidth="8" 
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={score ? 251.2 - (251.2 * (score.score / 1000)) : 251.2}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-5xl font-bold text-white drop-shadow-md">{score?.score || 0}</span>
                <span className="text-xs text-gray-400 mt-1">/ 1000</span>
              </div>
            </div>
          </div>

          {/* History Chart */}
          {historyData.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h4 className="text-gray-400 font-medium flex items-center space-x-2 mb-6">
                <TrendingUp size={18} className="text-indigo-400" />
                <span>Score Trajectory</span>
              </h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                      itemStyle={{ color: '#60A5FA', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#1f2937' }}
                      activeDot={{ r: 6, fill: '#818cf8', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

        {/* Gap Analysis Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Target className="text-rose-400" />
            <span>Critical Gaps Detected</span>
          </h3>
          
          {gaps.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center text-gray-400">
              No gaps detected. Run an evaluation to populate data.
            </div>
          ) : (
            gaps.map((gap, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-md relative overflow-hidden group hover:border-gray-600 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-orange-500"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">{gap.skill}</h4>
                    <span className="text-xs font-semibold px-2 py-1 bg-rose-500/10 text-rose-400 rounded-md uppercase tracking-wider">
                      {gap.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Target</div>
                    <div className="text-xl font-bold text-blue-400">{gap.targetScore}</div>
                  </div>
                </div>

                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-400">Current Competency</span>
                  <span className="font-semibold">{gap.userScore}</span>
                </div>
                
                {/* Visual Gap Bar */}
                <div className="w-full bg-gray-900 rounded-full h-2 flex border border-gray-700 overflow-hidden">
                  <div className="bg-emerald-500 h-2" style={{ width: `${(gap.userScore / gap.targetScore) * 100}%` }}></div>
                  <div className="bg-rose-500/30 h-2 flex-1 relative">
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0wIDRMOCA4TTAgMEw4IDRNMCA4TDQgOEwwIDhNMCAwbDggOE0wIDBsNC00TTAgMGwtNCA0IiBzdHJva2U9InJnYmEoMjQ0LCA2MywgOTQsIDAuNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-20"></div>
                  </div>
                </div>
                
                {/* Evidence Repo Tags */}
                {gap.evidence && gap.evidence.some(e => e.metadata?.repos?.length > 0) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold w-full mb-1">Evidence detected in:</span>
                    {Array.from(new Set(gap.evidence.flatMap(e => e.metadata?.repos || []))).map((repo, rIdx) => (
                      <span key={rIdx} className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
                        {repo}
                      </span>
                    ))}
                  </div>
                )}
                
                {gap.reason && (
                  <p className="mt-3 text-sm text-gray-400 italic">
                    {gap.reason}
                  </p>
                )}

                {gap.missingPatterns && gap.missingPatterns.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Missing Evidence Concepts:</p>
                    <div className="flex gap-2 flex-wrap">
                      {gap.missingPatterns.map((pattern, i) => (
                        <span key={i} className="text-xs bg-gray-900 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
