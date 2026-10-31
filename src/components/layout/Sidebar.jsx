import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Repeat,
  FileText,
  CreditCard,
  Users,
  Layers,
  FileCheck2,
  UserCheck,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation links based on user role
  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Subscriptions', path: '/subscriptions', icon: Repeat },
        { label: 'Invoices', path: '/invoices', icon: FileText },
        { label: 'Payments', path: '/payments', icon: CreditCard },
        { label: 'Customers', path: '/customers', icon: Users },
        { label: 'Pricing Plans', path: '/plans', icon: Layers },
        { label: 'Quotations', path: '/quotations', icon: FileCheck2 },
      ];
    } else if (user?.role === 'staff') {
      return [
        { label: 'Staff Dashboard', path: '/staff', icon: LayoutDashboard },
        { label: 'Customers', path: '/customers', icon: Users },
        { label: 'Subscriptions', path: '/subscriptions', icon: Repeat },
        { label: 'Quotations', path: '/quotations', icon: FileCheck2 },
        { label: 'Invoices', path: '/invoices', icon: FileText },
        { label: 'Record Payment', path: '/payments', icon: CreditCard },
      ];
    } else {
      // Customer Portal
      return [
        { label: 'My Subscription', path: '/customer', icon: LayoutDashboard },
        { label: 'Available Plans', path: '/customer/plans', icon: Layers },
        { label: 'My Invoices', path: '/customer/invoices', icon: FileText },
        { label: 'Payment History', path: '/customer/payments', icon: CreditCard },
        { label: 'My Profile', path: '/customer/profile', icon: UserCheck },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40
        w-64 bg-navy-900 text-slate-300
        flex flex-col border-r border-navy-800
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center">
                Bright<span className="text-brand-400">loop</span>
              </span>
              <span className="text-[10px] block font-medium uppercase tracking-wider text-slate-400 -mt-1">
                SaaS Billing
              </span>
            </div>
          </div>
        </div>

        {/* Current Active Role Pill */}
        <div className="px-5 py-3">
          <div className="bg-navy-800/80 rounded-lg p-2.5 border border-navy-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                user?.role === 'admin' ? 'bg-purple-400' :
                user?.role === 'staff' ? 'bg-blue-400' : 'bg-teal-400'
              }`} />
              <span className="text-xs font-semibold capitalize text-white">
                {user?.role} Workspace
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-navy-700 text-slate-300">
              {user?.role === 'admin' ? 'Full SLA' : user?.role === 'staff' ? 'Billing' : 'Portal'}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/staff' || item.path === '/customer'}
                onClick={() => onClose && onClose()}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30' 
                    : 'text-slate-300 hover:text-white hover:bg-navy-800'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 opacity-90" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout at bottom */}
        <div className="p-3 border-t border-navy-800">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-navy-800/50 hover:bg-navy-800 transition-colors">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
              alt={user?.name} 
              className="w-9 h-9 rounded-full object-cover border border-slate-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
