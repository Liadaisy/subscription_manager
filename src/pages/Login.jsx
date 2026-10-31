import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, User, Briefcase, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, loginAsRole, demoUsers, authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@brightloop.com');
  const [password, setPassword] = useState('admin');
  const [localError, setLocalError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLocalError('');
    const loggedUser = login(email, password);
    if (loggedUser) {
      redirectByRole(loggedUser.role);
    } else {
      setLocalError('Invalid email or password. Please use one of the demo credentials below.');
    }
  };

  const handleQuickDemo = (role) => {
    const roleUser = loginAsRole(role);
    if (roleUser) {
      redirectByRole(roleUser.role);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'staff') navigate('/staff');
    else if (role === 'customer') navigate('/customer');
    else navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-500 text-white shadow-xl shadow-brand-500/30 mb-4 ring-4 ring-white/10">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Bright<span className="text-brand-400">loop</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-medium">
            Next-Gen Subscription & Recurring Invoicing Engine
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          
          {(localError || authError) && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-lg shadow-brand-500/25 transition-all"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Credentials Matrix */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              ⚡ 1-Click Demo Logins
            </p>

            <div className="grid grid-cols-1 gap-2">
              
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-600 text-white">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-950">Log in as Administrator</p>
                    <p className="text-[11px] text-purple-700">admin@brightloop.com • Full Access</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-200/70 px-2 py-0.5 rounded">
                  Admin →
                </span>
              </button>

              {/* Staff Button */}
              <button
                type="button"
                onClick={() => handleQuickDemo('staff')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-950">Log in as Billing Staff</p>
                    <p className="text-[11px] text-blue-700">staff@brightloop.com • Invoicing & Subs</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-200/70 px-2 py-0.5 rounded">
                  Staff →
                </span>
              </button>

              {/* Customer Button */}
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/80 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-teal-600 text-white">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-teal-950">Log in as Customer (Acme Corp)</p>
                    <p className="text-[11px] text-teal-700">customer@acme.com • Client Portal</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-200/70 px-2 py-0.5 rounded">
                  Customer →
                </span>
              </button>

            </div>

          </div>

        </div>

        {/* Hackathon Footer Info */}
        <div className="text-center mt-6 text-xs text-slate-400">
          <p>Brightloop Subscription & Billing Architecture • Hackathon Build 2026</p>
        </div>

      </div>

    </div>
  );
}
