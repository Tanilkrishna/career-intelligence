import React from 'react';
import { Trophy, Star, Target, ArrowRight, X, Code2 } from 'lucide-react';

const AnalysisWowModal = ({ isOpen, onClose, data, onStartProject }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-gray-900 border border-gray-700 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        {/* Top Celebration Header */}
        <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-600 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="relative flex flex-col items-center">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/30 mb-2">
              <Trophy className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter">Evaluation Complete!</h2>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-center">
            <p className="text-gray-400 font-medium leading-relaxed">
              {data?.totalPatterns > 0 ? (
                <>We've scanned <span className="text-white font-bold">{data?.repoCount || 0} repositories</span> on your profile and verified your professional code patterns.</>
              ) : (
                <>Limited stack detection. We're still learning your ecosystem—here's what we can verify from your <span className="text-white font-bold">{data?.repoCount || 0} repositories</span> so far.</>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 flex flex-col items-center text-center group hover:border-indigo-500/30 transition-colors">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 mb-3">
                <Code2 size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Patterns Found</span>
              <span className="text-2xl font-black text-white">{data?.totalPatterns || 0}</span>
            </div>
            
            <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 flex flex-col items-center text-center group hover:border-emerald-500/30 transition-colors">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 mb-3">
                <Target size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Market Ready</span>
              <span className="text-2xl font-black text-white">{data?.readinessPercentage || 0}%</span>
            </div>
          </div>

          <div className="bg-indigo-950/20 p-6 rounded-2xl border border-indigo-500/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Target size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Career Blocker Identified</h4>
                <p className="text-xs text-gray-400">Analysis detected a critical technical hurdle.</p>
              </div>
            </div>
            <p className="text-sm text-indigo-200 italic leading-relaxed">
              "You are currently <span className="font-bold text-white">{Math.max(0, 100 - (data?.readinessPercentage || 0))}% away</span> from industry benchmarks for your role. Resolving <span className="font-bold text-white">{data?.topGap || 'Advanced Systems'}</span> is your highest-ROI move."
            </p>
          </div>

          <button 
            onClick={onStartProject}
            className="w-full py-4 bg-white text-gray-950 font-black rounded-2xl flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            <span>VIEW MY ACTION PLAN</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisWowModal;
