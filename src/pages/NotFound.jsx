import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { user } = useAuth();

  const homeRoute =
    user?.role === 'admin' ? '/admin' :
    user?.role === 'staff' ? '/staff' :
    user?.role === 'customer' ? '/customer' : '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">404</h2>
        <p className="text-base font-bold text-slate-700 mt-1">Page Not Found</p>
        <p className="text-xs text-slate-500 mt-2">
          The requested route doesn't exist or has moved. Return to your dashboard workspace below.
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            to={homeRoute}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
