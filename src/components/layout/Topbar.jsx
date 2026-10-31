import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Repeat,
  Plus
} from 'lucide-react';

export default function Topbar({ onMenuClick, onOpenCreateSub }) {
  const { user, logout, loginAsRole } = useAuth();
  const { overdueInvoicesCount, pendingInvoicesCount } = useData();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route to subscriptions or invoices search
    navigate(`/subscriptions?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu Button & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearch} className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subscriptions, customers, invoices..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </form>
      </div>

      {/* Right: Actions, Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-3">
        {/* Quick New Subscription button for Admin/Staff */}
        {user?.role !== 'customer' && onOpenCreateSub && (
          <button
            onClick={onOpenCreateSub}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Subscription</span>
          </button>
        )}

        {/* Notifications badge */}
        <div className="relative group">
          <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative transition-colors">
            <Bell className="w-5 h-5" />
            {overdueInvoicesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Quick Notification Tooltip/Dropdown */}
          <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 text-xs z-50">
            <p className="font-semibold text-slate-800 pb-2 border-b border-slate-100">Live Alerts</p>
            <div className="space-y-2 mt-2">
              {overdueInvoicesCount > 0 ? (
                <div className="flex items-start gap-2 text-rose-600 bg-rose-50 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span><strong>{overdueInvoicesCount} invoice(s)</strong> are overdue! Payment follow-up needed.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All payments up to date!</span>
                </div>
              )}
              <div className="text-slate-500 text-[11px]">
                {pendingInvoicesCount} invoices pending payment.
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="text-left hidden md:block">
              <span className="text-xs font-semibold text-slate-800 block leading-tight">{user?.name}</span>
              <span className="text-[10px] text-slate-500 capitalize">{user?.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div 
              className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
              onClick={() => setProfileDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 capitalize">
                  {user?.role} Access
                </span>
              </div>

              <div className="px-2 py-1.5 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 pb-1">
                  Switch Active Role
                </p>
                <button
                  onClick={() => loginAsRole('admin')}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                    user?.role === 'admin' ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Admin (Alex Morgan)
                </button>
                <button
                  onClick={() => loginAsRole('staff')}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                    user?.role === 'staff' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Staff (Sarah Chen)
                </button>
                <button
                  onClick={() => loginAsRole('customer')}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                    user?.role === 'customer' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Customer (David Miller)
                </button>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
