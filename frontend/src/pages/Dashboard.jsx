import React, { useState, useEffect } from 'react';
import { useCareerData } from '../hooks/useCareerData';
import apiClient from '../services/api/client';
import { useToast } from '../components/ToastProvider';
import { Play, Loader2, AlertCircle, Target, TrendingUp, Info, ExternalLink, ChevronDown, ChevronUp, Sparkles, BookOpen, Zap, Trophy, BarChart3, ArrowRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import CareerGPSBanner from '../components/CareerGPSBanner';
import AnalysisWowModal from '../components/AnalysisWowModal';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SkillExplanationPanel = ({ skillId, skillName }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  const fetchExplanation = async () => {
    if (data) {
      setIsOpen(!isOpen);
      return;
    }
    
    setLoading(true);
    try {
      const res = await apiClient.get(`/skills/explain/${skillId}`);
      setData(res.data.data);
      setIsOpen(true);
    } catch (err) {
      toast.error("Could not fetch score details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-700/50">
      <button 
        onClick={fetchExplanation}
        className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors group"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Info size={14} />}
        <span>Why this score?</span>
        {!loading && (isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
      </button>

      {isOpen && data && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.breakdown.map((item, idx) => (
              <div key={idx} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
                  <span className="text-sm font-bold text-indigo-400">{item.value} / 100</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20">
            <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={12} />
              Boost Your Score
            </h5>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.missingForNextLevel.map((item, idx) => (
                <li key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          {data.evidenceRepos.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Verified in:</span>
              {data.evidenceRepos.map((repo, idx) => (
                <a 
                  key={idx} 
                  href={`https://github.com/${repo}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded flex items-center gap-1 hover:text-white hover:border-gray-500 transition-colors"
                >
                  {repo} <ExternalLink size={8} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PromptModal = ({ isOpen, title, placeholder, onConfirm, onClose, initialValue = '' }) => {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { if (isOpen) setValue(initialValue); }, [isOpen, initialValue]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-600/20 rounded-2xl">
            <Zap size={24} className="text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        
        <input 
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onConfirm(value);
            if (e.key === 'Escape') onClose();
          }}
          placeholder={placeholder}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors mb-8"
        />

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-gray-800 text-gray-400 font-bold rounded-xl hover:bg-gray-700 transition-colors"
          >
            CANCEL
          </button>
          <button 
            onClick={() => onConfirm(value)}
            disabled={!value.trim()}
            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};

const MentorHistory = ({ 
  history, 
  isOpen, 
  onClose, 
  onSendMessage, 
  isSending, 
  sessions, 
  activeSessionId, 
  onSwitchSession, 
  onNewChat 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [view, setView] = useState('chat'); // 'chat' or 'list'
  const scrollRef = React.useRef(null);
 
  // Auto-scroll logic: focus specifically on the top of the CURRENT query
  React.useEffect(() => {
    if (scrollRef.current && view === 'chat' && history.length > 0) {
      const latestQuery = document.getElementById('latest-query');
      if (latestQuery) {
        latestQuery.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [history.length, view]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputValue.trim() || isSending) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const activeSession = sessions.find(s => s._id === activeSessionId);

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Sparkles size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">AI Mentor Sidekick</h3>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                {view === 'chat' ? (activeSession?.title || 'Technical Chat') : 'Chat History'}
              </p>
              <button 
                onClick={() => setView(view === 'chat' ? 'list' : 'chat')}
                className="text-[10px] text-indigo-400 hover:underline"
              >
                {view === 'chat' ? 'Switch' : 'Back to Chat'}
              </button>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full text-gray-400 transition-colors">
          <ArrowRight size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-900/50 scroll-smooth">
        {view === 'list' ? (
          <div className="p-4 space-y-2">
            <button 
              onClick={() => { onNewChat(); setView('chat'); }}
              className="w-full p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20 mb-6"
            >
              <Sparkles size={16} />
              NEW CHAT SESSION
            </button>
            
            <p className="text-[10px] text-gray-500 uppercase font-black px-2 mb-2">Previous Conversations</p>
            {sessions.length === 0 ? (
              <p className="text-center py-12 text-gray-600 text-sm italic">No history found for this project.</p>
            ) : (
              sessions.map(s => (
                <button
                  key={s._id}
                  onClick={() => { onSwitchSession(s._id); setView('chat'); }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    s._id === activeSessionId 
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-white ring-1 ring-indigo-500/20' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <p className="text-sm font-bold truncate">{s.title}</p>
                  <p className="text-[10px] opacity-60 mt-1">{new Date(s.updatedAt).toLocaleDateString()} • {s.messages?.length || 0} messages</p>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {!activeSessionId ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                <div className="p-4 bg-gray-800 rounded-full text-gray-600">
                  <Zap size={32} />
                </div>
                <p className="text-gray-500 text-sm px-10">Select a session or start a new one to begin your technical mentorship.</p>
                <button 
                  onClick={onNewChat}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-500 transition-all"
                >
                  START NEW SESSION
                </button>
              </div>
            ) : history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                <div className="p-4 bg-gray-800 rounded-full text-gray-600">
                  <Sparkles size={32} />
                </div>
                <p className="text-gray-500 text-sm">Session started.<br/>Ask me about architecture, code, or bugs.</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-10">
                {history.map((entry, idx) => {
                  const isUser = entry.role === 'user';
                  const isLatest = idx === history.length - 2 || (idx === history.length - 1 && isUser);
                  return (
                    <div 
                      key={idx} 
                      id={isLatest && isUser ? 'latest-query' : undefined}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 w-full`}
                    >
                      <div className={`p-4 rounded-2xl text-sm shadow-md leading-relaxed overflow-hidden ${
                        isUser 
                          ? 'bg-indigo-600 text-white rounded-tr-none max-w-[85%]' 
                          : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-none max-w-[90%] font-sans backdrop-blur-sm bg-gray-800/80'
                      }`}>
                        {isUser ? (
                          <div className="whitespace-pre-wrap break-words">{entry.content}</div>
                        ) : (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({node, ...props}) => <p className="mb-3 last:mb-0 break-words" {...props} />,
                              pre: ({node, ...props}) => <div className="w-full overflow-x-auto my-3 rounded-lg bg-gray-950 border border-gray-700" {...props} />,
                              code: ({node, inline, ...props}) => (
                                inline 
                                  ? <code className="bg-gray-900 px-1 py-0.5 rounded text-indigo-300 font-mono text-xs" {...props} />
                                  : <code className="block p-3 font-mono text-xs text-emerald-400 whitespace-pre" {...props} />
                              ),
                              ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-3 space-y-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-3 space-y-1" {...props} />,
                              li: ({node, ...props}) => <li className="text-gray-200" {...props} />,
                              strong: ({node, ...props}) => <strong className="text-indigo-400 font-black" {...props} />,
                              a: ({node, ...props}) => <a className="text-indigo-400 hover:underline font-bold" target="_blank" rel="noopener noreferrer" {...props} />,
                              table: ({node, ...props}) => (
                                <div className="w-full overflow-x-auto my-4 rounded-lg border border-gray-700 bg-gray-900/50">
                                  <table className="w-full text-left border-collapse" {...props} />
                                </div>
                              ),
                              thead: ({node, ...props}) => <thead className="bg-gray-800/50 text-indigo-300 font-bold border-b border-gray-700" {...props} />,
                              th: ({node, ...props}) => <th className="p-3 text-xs uppercase tracking-wider" {...props} />,
                              td: ({node, ...props}) => <td className="p-3 text-xs border-b border-gray-800/50 text-gray-300" {...props} />,
                              tr: ({node, ...props}) => <tr className="hover:bg-gray-800/30 transition-colors" {...props} />
                            }}
                          >
                            {entry.content}
                          </ReactMarkdown>
                        )}
                      </div>
                      {!isUser && (
                        <div className="flex items-center gap-1 mt-1.5 ml-1">
                          <div className="w-4 h-4 bg-indigo-500/20 rounded-full flex items-center justify-center">
                            <Sparkles size={10} className="text-indigo-400" />
                          </div>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Mentor AI</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {view === 'chat' && activeSessionId && (
        <div className="p-4 border-t border-gray-700 bg-gray-800/50 backdrop-blur-xl">
          <div className="flex gap-2">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a technical question..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              disabled={isSending}
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:grayscale"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-center">AI Mentor can make mistakes. Verify critical code.</p>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { state, score, gaps, recommendations, loading: dataLoading, error, refetch } = useCareerData();
  const userLevel = state?.userLevel || 0;
  
  // 1-2-5 Progressive Disclosure Logic
  const uiLevel = userLevel >= 5 ? 3 : (userLevel >= 1 ? 2 : 1);
  const filteredGaps = uiLevel === 1 ? (gaps || []).slice(0, 2) : (gaps || []);
  const filteredRecommendations = uiLevel === 1 ? (recommendations || []).slice(0, 1) : (recommendations || []);

  const [analyzing, setAnalyzing] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showMentorHistory, setShowMentorHistory] = useState(false);
  const [activeMentorProjectId, setActiveMentorProjectId] = useState(null);
  const [isAskingMentor, setIsAskingMentor] = useState(false);
  const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', placeholder: '', onConfirm: null, value: '' });
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [activeProjects, setActiveProjects] = useState([]);
  const [wowModal, setWowModal] = useState({ isOpen: false, data: null });
  const [isSharing, setIsSharing] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleShare = () => {
    const identifier = user.username || user._id || user.id;
    if (!identifier) {
      toast.error("User context missing. Please re-login.");
      return;
    }
    const shareUrl = `${window.location.origin}/career/${identifier}`;
    navigator.clipboard.writeText(shareUrl);
    setIsSharing(true);
    toast.success("Profile link copied to clipboard! Share it with recruiters.");
    setTimeout(() => setIsSharing(false), 2000);
  };

  const fetchProjects = async () => {
    try {
      const res = await apiClient.get('/career/projects/active');
      setActiveProjects(res.data.data);
    } catch (err) {
      console.error("Failed to fetch projects");
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const handleToggleTask = async (projectId, taskId) => {
    try {
      await apiClient.put(`/career/projects/${projectId}/tasks/${taskId}/toggle`);
      fetchProjects();
    } catch (err) {
      toast.error("Failed to update task.");
    }
  };

  const handleSubmitProject = async (projectId) => {
    setPromptModal({
      isOpen: true,
      title: 'Submit Project',
      placeholder: 'Enter GitHub Repository URL',
      onConfirm: async (url) => {
        setPromptModal(prev => ({ ...prev, isOpen: false }));
        try {
          setAnalyzing(true);
          const res = await apiClient.post('/career/projects/submit', { projectId, githubUrl: url });
          const { beforeScore, afterScore, gain } = res.data.data;
          toast.success(`Project verified! Score +${gain}`);
          refetch();
          fetchProjects();
        } catch (err) {
          toast.error("Submission failed. Ensure the repo is public.");
        } finally {
          setAnalyzing(false);
        }
      }
    });
  };

  const fetchSessions = async (projectId) => {
    try {
      const res = await apiClient.get(`/career/projects/${projectId}/chats`);
      setSessions(res.data.data);
      if (res.data.data.length > 0 && !activeSessionId) {
        setActiveSessionId(res.data.data[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch chat sessions");
    }
  };

  const handleOpenMentor = () => {
    setShowMentorHistory(true);
    
    // If no project is selected, auto-select the first active project
    if (!activeMentorProjectId && activeProjects.length > 0) {
      const firstProjectId = activeProjects[0]._id;
      setActiveMentorProjectId(firstProjectId);
      fetchSessions(firstProjectId);
    } else if (activeMentorProjectId) {
      fetchSessions(activeMentorProjectId);
    }
  };

  const handleAskAI = (projectId) => {
    setActiveMentorProjectId(projectId);
    setShowMentorHistory(true);
    fetchSessions(projectId);
  };

  const handleStartNewChat = async () => {
    if (!activeMentorProjectId) return;
    
    setPromptModal({
      isOpen: true,
      title: 'New Session',
      placeholder: 'e.g. Auth Debugging, System Design...',
      onConfirm: async (title) => {
        setPromptModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await apiClient.post(`/career/projects/${activeMentorProjectId}/chats`, { title });
          const newSession = res.data.data;
          setSessions(prev => [newSession, ...prev]);
          setActiveSessionId(newSession._id);
          toast.success("New mentor session started!");
        } catch (err) {
          toast.error("Failed to start new session.");
        }
      }
    });
  };

  const handleSendChatMessage = async (query) => {
    if (!activeSessionId) {
      toast.error("Please start or select a session first.");
      return;
    }

    try {
      setIsAskingMentor(true);
      const res = await apiClient.post(`/career/chats/${activeSessionId}/message`, { query });
      
      // Update local session state to reflect new messages immediately
      setSessions(prev => prev.map(s => {
        if (s._id === activeSessionId) {
          return {
            ...s,
            messages: [...(s.messages || []), { role: 'user', content: query }, { role: 'assistant', content: res.data.data }],
            updatedAt: new Date()
          };
        }
        return s;
      }));
      
      toast.success("AI Mentor has responded!");
    } catch (err) {
      toast.error("AI Mentor is currently busy. Try again later.");
    } finally {
      setIsAskingMentor(false);
    }
  };

  const runAnalysis = async () => {
    try {
      if (!githubUrl.trim()) return;
      
      setAnalyzing(true);
      setAnalysisProgress(0);
      setAnalysisStep('Initializing pipeline...');
      const loadingToastId = toast.loading('Evaluation started ⏳');

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
            toast.dismiss(loadingToastId);

            if (job.status === 'completed') {
              toast.success('Analysis complete 🚀');
              
              // Trigger Wow Modal (V2.1)
              // Fetch latest score to get readiness % and milestone
              const scoreRes = await apiClient.get('/career/score');
              const gapsRes = await apiClient.get('/career/gaps');
              
              setWowModal({
                isOpen: true,
                data: {
                  repoCount: job.metadata?.repoCount || 0,
                  totalPatterns: job.metadata?.totalPatterns || 0,
                  readinessPercentage: scoreRes.data.data.readinessPercentage,
                  topGap: gapsRes.data.data[0]?.skill || 'Advanced Systems'
                }
              });

              refetch(); // Refresh the dashboard data
            } else {
              toast.error(`Analysis failed: ${job.error || 'Unknown error'}`);
            }
          }
        } catch (e) {
          clearInterval(poll);
          setAnalyzing(false);
          toast.dismiss(loadingToastId);
          toast.error('Failed to fetch analysis status');
        }
      }, 1000); // poll every second

    } catch (err) {
      console.error(err);
      setAnalyzing(false);
      toast.error(err.response?.data?.message || 'Failed to start evaluation');
    }
  };

  if (dataLoading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

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
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* Doubt Killer Calibration Header */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Target size={16} className="text-emerald-400" />
          </div>
          <p className="text-xs text-gray-400 font-medium">
            System Calibration: <span className="text-gray-200">Based on {state?.analysisMetadata?.filesAnalyzed || 0} files analyzed. Compared with industry-aligned {user?.targetRole || 'Backend'} standards.</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Diagnostic Integrity: High</p>
        </div>
      </div>
      
      {/* Career GPS Banner (V2.1) */}
      <CareerGPSBanner 
        weeksToReady={score?.weeksToReady} 
        targetRole={user?.targetRole || 'Fullstack Engineer'} 
        readinessPercentage={score?.readinessPercentage || 0}
      />

      {/* Career Readiness Tier & Milestone */}
      {score?.score !== undefined && (
        <div className={`border rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10 ${
          score.score > 600 ? 'bg-emerald-950/20 border-emerald-500/30' : 
          score.score > 300 ? 'bg-blue-950/20 border-blue-500/30' : 
          'bg-gray-900/40 border-gray-700'
        }`}>
          <div className="flex items-start space-x-5">
            <div className={`p-4 rounded-2xl shrink-0 shadow-lg ${
              score.score > 600 ? 'bg-emerald-500/20 text-emerald-400' : 
              score.score > 300 ? 'bg-blue-500/20 text-blue-400' : 
              'bg-gray-700/20 text-gray-400'
            }`}>
              <Trophy size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                {score.milestoneMessage}
                {score.score > 700 && <Sparkles className="text-yellow-400" size={16} />}
              </h3>
              <p className="text-gray-400 text-sm max-w-md font-medium leading-relaxed">
                {score.score > 600 ? 'Your portfolio and code patterns demonstrate senior-grade architectural thinking.' :
                 score.score > 300 ? 'You have a solid technical foundation. Focus on consistency and implementation depth.' :
                 'Building initial foundations. Focus on mandatory core skills to see the biggest gains.'}
              </p>
            </div>
          </div>
          <div className={`text-center px-8 py-3 rounded-2xl border-2 w-full md:w-auto transform hover:scale-105 transition-transform ${
            score.score > 600 ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 
            score.score > 300 ? 'bg-blue-950/40 border-blue-500/30 text-blue-400' : 
            'bg-gray-900 border-gray-700 text-gray-400'
          }`}>
            <span className="block text-xs uppercase font-black mb-1 tracking-widest opacity-70">Readiness Grade</span>
            <span className="text-4xl font-black italic">
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
          
          <button 
            onClick={handleShare}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all border shrink-0 ${
              isSharing ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400' : 'bg-gray-700/30 border-gray-700 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            <ExternalLink size={20} />
            <span>{isSharing ? 'Copied!' : 'Share Profile'}</span>
          </button>
        </div>
      </div> </div>

      {/* Growth Layer: Next Best Move Card */}
      {!analyzing && score?.score !== undefined && (
        <div className="bg-gradient-to-r from-indigo-900/40 via-gray-900 to-gray-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-900/40">
              <Zap className="text-white" size={24} fill="currentColor" />
            </div>
            <div>
              <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-1">Your Next Best Move</h4>
              <p className="text-white font-bold text-lg leading-tight">
                {gaps.length > 0 ? `Master ${gaps[0].skill} to unlock ~120 points` : 'You are at peak readiness. Time to share your profile!'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard/recommendations')}
            className="px-8 py-4 bg-white text-gray-950 font-black rounded-2xl hover:bg-indigo-100 transition-all active:scale-95 shadow-xl shadow-black/20 flex items-center gap-2"
          >
            TAKE ACTION
            <ArrowRight size={18} />
          </button>
        </div>
      )}

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
          <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-tr-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
            
            <h4 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">Market Readiness</h4>
            
            {/* Simple Radial visualization using SVG */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="text-gray-900 stroke-current" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="50" cy="50" r="40" 
                  className="text-indigo-500 stroke-current drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out" 
                  strokeWidth="8" 
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={(() => {
                    const pct = score?.readinessPercentage;
                    if (typeof pct !== 'number' || isNaN(pct)) return 251.2;
                    return 251.2 - (251.2 * (pct / 100));
                  })()}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <div className="flex items-baseline">
                  <span className="text-6xl font-black text-white tracking-tighter">{score?.readinessPercentage || 0}</span>
                  <span className="text-2xl font-bold text-indigo-400">%</span>
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-tighter">Ready for Hire</span>
              </div>
            </div>

            {/* Weekly Momentum Badge */}
            {score?.weeklyGain !== undefined && (
              <div className={`mt-8 px-4 py-2 rounded-full border-2 flex items-center gap-2 animate-bounce-subtle ${
                score.weeklyGain > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                score.weeklyGain < 0 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 
                'bg-gray-800 border-gray-700 text-gray-400'
              }`}>
                {score.weeklyGain > 0 ? <TrendingUp size={14} /> : <Zap size={14} />}
                <span className="text-xs font-black uppercase tracking-wider">
                  {score.weeklyGain > 0 ? `+${score.weeklyGain} Weekly Gain` : 
                   score.weeklyGain < 0 ? `${score.weeklyGain} Points` : 'Stable Momentum'}
                </span>
              </div>
            )}
          </div>

          {/* Active Projects (Retention Loop) */}
          {activeProjects.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h4 className="text-gray-400 font-medium flex items-center space-x-2 mb-6 uppercase tracking-wider text-xs">
                <BookOpen size={18} className="text-emerald-400" />
                <span>In Progress</span>
              </h4>
              <div className="space-y-4">
                {activeProjects.map((p, idx) => {
                  const isStuck = p.lastTaskUpdate && (new Date() - new Date(p.lastTaskUpdate)) > (48 * 60 * 60 * 1000);
                  const isAlmostDone = p.progress >= 75 && p.progress < 100;
                  
                  return (
                    <div key={idx} className={`bg-gray-900/50 p-4 rounded-xl border group transition-colors ${isStuck ? 'border-amber-500/30' : isAlmostDone ? 'border-indigo-500/30' : 'border-gray-700/50 hover:border-emerald-500/30'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                          <h5 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{p.title}</h5>
                          {isStuck && <span className="text-[10px] font-black text-amber-500 animate-pulse uppercase tracking-tighter">Stuck? Ask Mentor →</span>}
                          {isAlmostDone && <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Almost there! 🚀</span>}
                        </div>
                        <span className="text-[10px] font-black text-emerald-400">+{p.predictedGain} PTS</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mb-2 font-bold uppercase">
                        <span>Progress</span>
                        <span>{p.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-950 rounded-full h-1 overflow-hidden mb-4">
                        <div className={`h-1 transition-all duration-1000 ${isAlmostDone ? 'bg-indigo-500' : 'bg-emerald-500'}`} style={{ width: `${p.progress}%` }}></div>
                      </div>

                      {/* Task Checklist (V2.4) */}
                      <div className="space-y-2 mb-4">
                         {p.tasks?.map((task, ti) => (
                           <div 
                             key={ti} 
                             onClick={() => handleToggleTask(p._id, task._id)}
                             className="flex items-center gap-2 cursor-pointer group/task"
                           >
                             <div className={`w-3 h-3 rounded-sm border ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 group-hover/task:border-emerald-500'}`}></div>
                             <span className={`text-[10px] font-medium transition-colors ${task.completed ? 'text-gray-500 line-through' : 'text-gray-400 group-hover/task:text-gray-300'}`}>
                               {task.label}
                             </span>
                           </div>
                         ))}
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAskAI(p._id)}
                          className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-[10px] font-black rounded-lg transition-all uppercase tracking-tighter"
                        >
                          Ask AI Mentor
                        </button>
                        <button 
                          onClick={() => handleSubmitProject(p._id)}
                          className={`flex-[2] py-2 font-black rounded-lg transition-all uppercase tracking-tighter text-[10px] border ${p.progress < 100 ? 'bg-gray-800/50 text-gray-600 border-gray-700' : 'bg-white/5 hover:bg-emerald-500 hover:text-white text-emerald-400 border-emerald-500/20'}`}
                          disabled={p.progress < 100}
                        >
                          {p.progress < 100 ? 'Complete Tasks First' : 'Submit for Verification'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* History Chart */}
          {historyData.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h4 className="text-gray-400 font-medium flex items-center space-x-2 mb-6">
                <TrendingUp size={18} className="text-indigo-400" />
                <span>Score Trajectory</span>
              </h4>
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height={192}>
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
          
          {filteredGaps.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center text-gray-400">
              No gaps detected. Run an evaluation to populate data.
            </div>
          ) : (
            filteredGaps.map((gap, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-md relative overflow-hidden group hover:border-gray-600 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-orange-500"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      {gap.skill}
                      {gap.severity >= 70 && <AlertCircle size={16} className="text-rose-500" />}
                    </h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border ${
                      gap.severity >= 70 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {gap.status || 'Moderate Gap'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">{gap.severity || gap.urgencyScore}%</span>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Severity Score</p>
                  </div>
                </div>

                {/* Decision Engine Metadata (V2) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                   <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                      <p className="text-[10px] text-gray-500 uppercase font-black mb-1 tracking-tighter">Impact</p>
                      <p className="text-sm font-bold text-emerald-400">{gap.careerImpact || '+120 PTS'}</p>
                   </div>
                   <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                      <p className="text-[10px] text-gray-500 uppercase font-black mb-1 tracking-tighter">Difficulty</p>
                      <p className="text-sm font-bold text-white">{gap.difficulty || 'Medium'}</p>
                   </div>
                   <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                      <p className="text-[10px] text-gray-500 uppercase font-black mb-1 tracking-tighter">Est. Time</p>
                      <p className="text-sm font-bold text-white">{gap.estTime || '2-3 hours'}</p>
                   </div>
                   <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                      <p className="text-[10px] text-gray-500 uppercase font-black mb-1 tracking-tighter">ROI</p>
                      <p className="text-sm font-bold text-indigo-400">High</p>
                   </div>
                </div>

                {/* Proof Layer (V2) */}
                {gap.proofs?.length > 0 && (
                   <div className="mb-6 space-y-2">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-1">
                        <Zap size={10} className="text-indigo-400" />
                        Technical Proof Points (AST)
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {gap.proofs.slice(0, 4).map((proof, pi) => (
                          <div key={pi} className="flex flex-col bg-gray-950 p-3 rounded-lg border border-gray-700/50 font-mono group/proof hover:border-indigo-500/30 transition-colors">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] text-indigo-400 truncate max-w-[150px]">{proof.repo}/{proof.file}</span>
                                <span className="text-[9px] text-gray-600">L:{proof.line}</span>
                             </div>
                             <p className="text-[9px] text-gray-400 truncate italic group-hover/proof:text-emerald-400 transition-colors">"{proof.snippet}"</p>
                          </div>
                        ))}
                      </div>
                      {gap.proofs.length > 4 && <p className="text-[9px] text-gray-600 text-center italic mt-1">+ {gap.proofs.length - 4} other verified signals across your repos</p>}
                   </div>
                )}

                {gap.impactExplanation && (
                  <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Why this matters:</p>
                    <p className="text-sm text-gray-300 leading-relaxed italic">
                      "{gap.impactExplanation}"
                    </p>
                  </div>
                )}
                
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

                {/* Skill Explanation Expansion */}
                {gap.skillId && (
                  <SkillExplanationPanel skillId={gap.skillId} skillName={gap.skill} />
                )}

              </div>
            ))
          )}
        </div>
      </div>

      {/* V2.1 Psychology Modal */}
      <AnalysisWowModal 
        isOpen={wowModal.isOpen} 
        onClose={() => setWowModal({ ...wowModal, isOpen: false })}
        data={wowModal.data}
        onStartProject={() => navigate('/dashboard/recommendations')}
      />

      {/* Floating AI Mentor Trigger (Premium FAB) */}
      {!showMentorHistory && (
        <button 
          onClick={handleOpenMentor}
          className="fixed bottom-8 right-8 z-[60] group flex items-center gap-3 bg-gray-900/80 backdrop-blur-xl border border-indigo-500/30 hover:border-indigo-400/60 p-4 rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 animate-in fade-in zoom-in duration-300"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl group-hover:bg-indigo-500/40 transition-colors rounded-full"></div>
            <Sparkles className="text-indigo-400 relative z-10 animate-pulse" size={24} />
            {sessions.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] flex items-center justify-center rounded-full font-black ring-2 ring-gray-900">
                {sessions.length}
              </span>
            )}
          </div>
          <div className="flex flex-col items-start pr-2">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Sidekick</span>
            <span className="text-sm font-bold text-white leading-none">Mentor History</span>
          </div>
        </button>
      )}

      {/* AI Mentor History Sidekick */}
      <MentorHistory 
        history={sessions.find(s => s._id === activeSessionId)?.messages || []} 
        isOpen={showMentorHistory} 
        onClose={() => setShowMentorHistory(false)} 
        onSendMessage={handleSendChatMessage}
        isSending={isAskingMentor}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSwitchSession={setActiveSessionId}
        onNewChat={handleStartNewChat}
      />

      {/* Global Prompt Replacement Modal */}
      <PromptModal 
        isOpen={promptModal.isOpen}
        title={promptModal.title}
        placeholder={promptModal.placeholder}
        onConfirm={promptModal.onConfirm}
        onClose={() => setPromptModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Dashboard;
