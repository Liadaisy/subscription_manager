import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, CheckCircle2, UserCheck } from 'lucide-react';

export default function DemoNotice() {
  const { user, loginAsRole } = useAuth();
  const { resetDemoData } = useData();
  const [expanded, setExpanded] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all subscriptions, invoices, and payments back to initial demo state?')) {
      resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  return (
    <div className="bg-gradient-to-r from-navy-900 via-indigo-950 to-brand-900 text-white px-4 py-2.5 border-b border-indigo-800/40 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left side: Role info + Guide toggle */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold border border-brand-400/30">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Hackathon Live Demo
          </span>

          <span className="text-slate-300 hidden sm:inline">
            Logged in as: <strong className="text-white capitalize">{user?.role}</strong> ({user?.name})
          </span>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-brand-300 hover:text-white underline underline-offset-2 flex items-center gap-1 font-medium ml-1"
          >
            <span>Demo Workflow Guide</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right side: 1-click role switcher & reset button */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden md:inline text-[11px]">Quick Role Switch:</span>
          
          <div className="flex items-center bg-navy-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => loginAsRole('admin')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                user?.role === 'admin' 
                  ? 'bg-brand-600 text-white shadow-sm font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-navy-700'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => loginAsRole('staff')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                user?.role === 'staff' 
                  ? 'bg-brand-600 text-white shadow-sm font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-navy-700'
              }`}
            >
              Staff
            </button>
            <button
              onClick={() => loginAsRole('customer')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                user?.role === 'customer' 
                  ? 'bg-brand-600 text-white shadow-sm font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-navy-700'
              }`}
            >
              Customer
            </button>
          </div>

          <button
            onClick={handleReset}
            title="Reset demo data to initial factory state"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors border border-white/10 text-[11px]"
          >
            <RefreshCw className={`w-3 h-3 ${resetSuccess ? 'text-emerald-400' : ''}`} />
            <span>{resetSuccess ? 'Reset Complete!' : 'Reset Demo'}</span>
          </button>
        </div>

      </div>

      {/* Expanded Workflow Roadmap */}
      {expanded && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-indigo-800/50 pb-1">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-slate-200 text-xs">
            <div className="bg-navy-800/70 p-2.5 rounded-lg border border-slate-700">
              <div className="font-semibold text-brand-300 flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]">1</span>
                Admin Login
              </div>
              <p className="text-[11px] text-slate-300">Creates/manages pricing tiers & monitors MRR and analytics.</p>
            </div>

            <div className="bg-navy-800/70 p-2.5 rounded-lg border border-slate-700">
              <div className="font-semibold text-brand-300 flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]">2</span>
                Staff Creates Sub
              </div>
              <p className="text-[11px] text-slate-300">Staff picks customer, plan, and billing cycle (Monthly, Yearly).</p>
            </div>

            <div className="bg-navy-800/70 p-2.5 rounded-lg border border-slate-700">
              <div className="font-semibold text-brand-300 flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]">3</span>
                Invoice Generated
              </div>
              <p className="text-[11px] text-slate-300">Itemized invoice with tax & discount is created automatically.</p>
            </div>

            <div className="bg-navy-800/70 p-2.5 rounded-lg border border-slate-700">
              <div className="font-semibold text-brand-300 flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]">4</span>
                Record Payment
              </div>
              <p className="text-[11px] text-slate-300">Staff records payment against invoice (marks it Paid instantly).</p>
            </div>

            <div className="bg-navy-800/70 p-2.5 rounded-lg border border-slate-700">
              <div className="font-semibold text-brand-300 flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]">5</span>
                Customer Verifies
              </div>
              <p className="text-[11px] text-slate-300">Customer views active sub, renewal countdown, and prints invoice.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
