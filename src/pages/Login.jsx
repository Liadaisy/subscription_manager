
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSubmitting(true);

    try {
      const loggedUser = await login(email, password);

      if (loggedUser) {
        redirectByRole(loggedUser.role);
      }
    } catch (error) {
      setLocalError(error.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
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

            {/* Email Field */}
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

            {/* Password Field */}
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
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>
                {submitting ? 'Signing in...' : 'Sign In to Dashboard'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          <p>Brightloop Subscription & Billing Architecture • Hackathon Build 2026</p>
        </div>

      </div>
    </div>
  );
}
