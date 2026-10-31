import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import RecordPaymentModal from '../../components/payments/RecordPaymentModal';
import {
  CreditCard,
  Search,
  Plus,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Receipt,
  FileCheck,
  Info
} from 'lucide-react';

export default function PaymentsPage() {
  const { payments } = useData();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const filteredPayments = useMemo(() => {
    return payments.filter(pay => {
      if (user?.role === 'customer') {
        if (pay.customerId !== user.customerId && !pay.customerName?.includes(user.company || '')) {
          return false;
        }
      }

      const matchSearch =
        pay.id.toLowerCase().includes(search.toLowerCase()) ||
        (pay.reference || '').toLowerCase().includes(search.toLowerCase()) ||
        (pay.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
        (pay.invoiceId || '').toLowerCase().includes(search.toLowerCase());

      const matchMethod = methodFilter === 'All' || (pay.paymentMethod || '').toLowerCase().includes(methodFilter.toLowerCase());

      return matchSearch && matchMethod;
    });
  }, [payments, search, methodFilter, user]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Payment Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture, track, and verify customer payments, transaction hashes, and invoice settlements.
          </p>
        </div>

        {user?.role !== 'customer' && (
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        )}
      </div>

      {/* Demo Simulation Distinction Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-start sm:items-center justify-between gap-4 text-xs text-amber-900 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-amber-950">⚡ Demo Payment Simulation Mode</p>
            <p className="text-amber-800 text-[11px] mt-0.5">
              All payment transactions shown are demo simulated entries stored in localStorage. In production, this wires to Stripe, PayPal, or UPI webhook endpoints via our modular API adapter.
            </p>
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold uppercase tracking-wider hidden md:inline-block">
          Simulation Active
        </span>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt ID, reference, customer..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="All">All Methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Wire">Wire Transfer</option>
            <option value="UPI">UPI / Digital</option>
            <option value="PayPal">PayPal</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Receipt ID</th>
                <th className="py-3 px-4">Invoice Ref</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Txn Reference</th>
                <th className="py-3 px-4 text-right">Amount Captured</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                      {pay.id}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-brand-600">
                      {pay.invoiceId}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {pay.customerName}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {pay.paymentMethod}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {pay.paymentDate}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 truncate max-w-[140px]">
                      {pay.reference}
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 text-sm">
                      +${Number(pay.amount).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Completed</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No payment records found matching the query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
      />

    </div>
  );
}
