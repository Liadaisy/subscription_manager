import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import InvoiceModal from '../../components/invoices/InvoiceModal';
import {
  Sparkles,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Download,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export default function CustomerPortal() {
  const { user } = useAuth();
  const { subscriptions, invoices, payments, plans } = useData();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Match customer subscriptions & invoices by customerId or email
  const customerSubs = subscriptions.filter(
    s => s.customerId === user?.customerId || s.customerEmail === user?.email
  );
  const activeSub = customerSubs.find(s => s.status === 'Active') || customerSubs[0];

  const customerInvoices = invoices.filter(
    i => i.customerId === user?.customerId || i.customerEmail === user?.email
  );

  const customerPayments = payments.filter(
    p => p.customerId === user?.customerId || p.customerName?.includes(user?.company || '')
  );

  // Calculate days remaining until renewal
  const calculateDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = activeSub ? calculateDaysRemaining(activeSub.expiryDate) : null;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Customer Header */}
      <div className="bg-gradient-to-r from-navy-900 via-indigo-900 to-brand-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brand-500/20 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 font-semibold text-xs border border-brand-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Client Account
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Account: <strong className="text-white">{user?.company || 'Acme Corporation'}</strong> • ID: {user?.customerId || 'CUST-001'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/customer/plans"
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-500/30 transition-all flex items-center gap-2"
            >
              <span>Explore Plans & Upgrade</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Subscription Hero Card */}
      {activeSub ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-navy-900">{activeSub.planName}</h2>
                <Badge status={activeSub.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Subscription Reference ID: {activeSub.id}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-2xl font-extrabold text-navy-900">${Number(activeSub.amount).toFixed(2)}</span>
              <span className="text-xs text-slate-500 font-medium"> / {activeSub.billingCycle}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block mb-1">Billing Interval</span>
              <p className="text-sm font-bold text-slate-800">{activeSub.billingCycle}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Auto-renewal enabled</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block mb-1">Next Renewal Date</span>
              <p className="text-sm font-bold text-slate-800">{activeSub.expiryDate}</p>
              <p className="text-[11px] text-brand-600 font-medium mt-0.5">
                {daysRemaining !== null && daysRemaining > 0 
                  ? `${daysRemaining} days remaining` 
                  : 'Due for renewal'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block mb-1">Provisioned On</span>
              <p className="text-sm font-bold text-slate-800">{activeSub.startDate}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Service fully active</p>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
          <Clock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-navy-900">No Active Subscription Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not have an active subscription yet. Check our available SaaS tiers to subscribe now.
          </p>
          <Link
            to="/customer/plans"
            className="inline-flex mt-4 px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold"
          >
            Browse Available Plans
          </Link>
        </div>
      )}

      {/* Grid: My Invoices & Payment History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* My Invoices */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">My Invoices</h3>
              <p className="text-xs text-slate-500">Download, print or view your official tax receipts</p>
            </div>
            <Link
              to="/customer/invoices"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {customerInvoices.length > 0 ? (
              customerInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between gap-3 transition-colors text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900">{inv.id}</span>
                      <Badge status={inv.status} size="xs" />
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Issued {inv.issueDate} • Due {inv.dueDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-navy-900">${Number(inv.totalAmount).toFixed(2)}</span>
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1 text-[11px]"
                    >
                      <FileText className="w-3 h-3 text-brand-600" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No invoices recorded yet.</p>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Payment History</h3>
              <p className="text-xs text-slate-500">Captured payments and processed card receipts</p>
            </div>
            <Link
              to="/customer/payments"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {customerPayments.length > 0 ? (
              customerPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between gap-3 transition-colors text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900">{pay.id}</span>
                      <Badge status="completed" label="Success" size="xs" />
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {pay.paymentMethod} • Ref: {pay.reference}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-emerald-600 text-sm block">${Number(pay.amount).toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">{pay.paymentDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No payment transactions yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Invoice Modal Preview */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />

    </div>
  );
}
