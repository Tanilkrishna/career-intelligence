import React from 'react';
import { MapPin, ArrowRight, Clock, Sparkles } from 'lucide-react';

const CareerGPSBanner = ({ weeksToReady, targetRole, readinessPercentage }) => {
  if (!weeksToReady) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/30 shadow-inner">
            <MapPin className="text-white" size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-lg font-black italic uppercase leading-none">
              ~{weeksToReady} Weeks to Hire
            </span>
            <span className="text-emerald-300/60 text-[10px] font-bold uppercase tracking-tighter">
              Based on your pace & similar users
            </span>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-bold text-white uppercase tracking-wider">
            <span>Market Readiness</span>
            <span>{readinessPercentage}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm p-0.5 border border-white/10">
            <div 
              className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ width: `${readinessPercentage}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-indigo-100 font-bold uppercase">
            <span>Baseline</span>
            <span>Hired 🚀</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerGPSBanner;
