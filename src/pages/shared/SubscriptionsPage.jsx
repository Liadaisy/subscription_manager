import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import CreateSubscriptionModal from '../../components/subscriptions/CreateSubscriptionModal';
import InvoiceModal from '../../components/invoices/InvoiceModal';
import {
  Repeat,
  Plus,
  Search,
  Filter,
  FileText,
  PauseCircle,
  PlayCircle,
  XCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export default function SubscriptionsPage() {
  const { subscriptions, updateSubscriptionStatus, generateInvoiceFromSubscription } = useData();
  const { user } = useAuth();
  const location = useLocation();

  // Parse potential search query param from Topbar
  const queryParam = new URLSearchParams(location.search).get('q') || '';

  const [search, setSearch] = useState(queryParam);
  const [statusFilter, setStatusFilter] = useState('All');
  const [cycleFilter, setCycleFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      // Role scope: if customer, restrict to their subscriptions
      if (user?.role === 'customer') {
        if (sub.customerId !== user.customerId && sub.customerEmail !== user.email) {
          return false;
        }
      }

      const matchSearch =
        sub.customerName.toLowerCase().includes(search.toLowerCase()) ||
        sub.customerCompany.toLowerCase().includes(search.toLowerCase()) ||
        sub.planName.toLowerCase().includes(search.toLowerCase()) ||
        sub.id.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || sub.status.toLowerCase() === statusFilter.toLowerCase();
      const matchCycle = cycleFilter === 'All' || sub.billingCycle.toLowerCase() === cycleFilter.toLowerCase();

      return matchSearch && matchStatus && matchCycle;
    });
  }, [subscriptions, search, statusFilter, cycleFilter, user]);

  const handleGenerateInvoice = (sub) => {
    const inv = generateInvoiceFromSubscription(sub);
    setGeneratedInvoice(inv);
    setActionNotice(`Invoice ${inv.id} generated successfully for ${sub.customerCompany}!`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleStatusChange = (subId, newStatus) => {
    updateSubscriptionStatus(subId, newStatus);
    setActionNotice(`Subscription ${subId} marked as ${newStatus}.`);
    setTimeout(() => setActionNotice(''), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Subscription Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision, monitor recurring terms, trigger invoice cycles, and manage customer tiers.
          </p>
        </div>

        {user?.role !== 'customer' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Subscription</span>
          </button>
        )}
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, plan, sub ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Overdue">Overdue</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Cycle:</span>
            <select
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="All">All Cycles</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

        </div>

      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Subscription ID</th>
                <th className="py-3 px-4">Customer & Account</th>
                <th className="py-3 px-4">Plan & Tier</th>
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4">Billing Window</th>
                <th className="py-3 px-4 text-right">Recurring Rate</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                      {sub.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{sub.customerCompany || sub.customerName}</p>
                      <p className="text-[11px] text-slate-400">{sub.customerEmail}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {sub.planName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {sub.billingCycle}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <p>Start: {sub.startDate}</p>
                      <p className="text-[11px] text-slate-400">Renews: {sub.expiryDate}</p>
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-navy-900 text-sm">
                      ${Number(sub.amount).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge status={sub.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Generate Invoice button */}
                        <button
                          onClick={() => handleGenerateInvoice(sub)}
                          title="Generate Invoice for this subscription"
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Invoice</span>
                        </button>

                        {/* Pause / Resume action */}
                        {sub.status === 'Active' && (
                          <button
                            onClick={() => handleStatusChange(sub.id, 'Paused')}
                            title="Pause Subscription"
                            className="p-1 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        )}

                        {sub.status === 'Paused' && (
                          <button
                            onClick={() => handleStatusChange(sub.id, 'Active')}
                            title="Resume Subscription"
                            className="p-1 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        )}

                        {sub.status !== 'Canceled' && (
                          <button
                            onClick={() => handleStatusChange(sub.id, 'Canceled')}
                            title="Cancel Subscription"
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No subscriptions matching the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateSubscriptionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <InvoiceModal
        isOpen={Boolean(generatedInvoice)}
        onClose={() => setGeneratedInvoice(null)}
        invoice={generatedInvoice}
      />

    </div>
  );
}
