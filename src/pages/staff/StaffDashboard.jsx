import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import CreateSubscriptionModal from '../../components/subscriptions/CreateSubscriptionModal';
import RecordPaymentModal from '../../components/payments/RecordPaymentModal';
import InvoiceModal from '../../components/invoices/InvoiceModal';
import {
  Users,
  Repeat,
  FileText,
  CreditCard,
  FileCheck2,
  Clock,
  Plus,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function StaffDashboard() {
  const {
    customers,
    subscriptions,
    invoices,
    quotations,
    pendingInvoicesCount,
    convertQuotationToSubscription
  } = useData();

  const [createSubModalOpen, setCreateSubModalOpen] = useState(false);
  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [convertedNotice, setConvertedNotice] = useState('');

  // Unpaid invoices needing attention
  const unpaidInvoices = invoices.filter(i => i.status !== 'Paid').slice(0, 5);

  const handleConvertQuote = (quoteId) => {
    const res = convertQuotationToSubscription(quoteId);
    if (res) {
      setConvertedNotice(`Quote ${quoteId} converted to Active Subscription ${res.subscription.id} and Invoice ${res.invoice.id}!`);
      setTimeout(() => setConvertedNotice(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Ops */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Staff Operations Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Billing Specialist
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage customer accounts, provision subscriptions, dispatch quotes, and record payments.
          </p>
        </div>

        {/* Quick Operations Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateSubModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Subscription</span>
          </button>
          
          <button
            onClick={() => setRecordPaymentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Permissions & Security Badge */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <p className="font-semibold">Staff Operational Scope</p>
            <p className="text-[11px] text-blue-700">
              Authorized for customer onboarding, subscription issuance, quotes, and payment recording. System tier deletion is restricted.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-blue-200/60 font-semibold text-blue-800 text-[11px]">
          SLA Grade: Operational
        </span>
      </div>

      {convertedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{convertedNotice}</span>
        </div>
      )}

      {/* Staff KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Customer Accounts"
          value={customers.length}
          subtext="Ready for billing"
          icon={Users}
          iconColor="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Active Subscriptions"
          value={subscriptions.filter(s => s.status === 'Active').length}
          subtext="Under management"
          icon={Repeat}
          iconColor="bg-brand-50 text-brand-600"
        />

        <StatCard
          title="Invoices Pending"
          value={pendingInvoicesCount}
          subtext="Requires collection"
          icon={Clock}
          iconColor="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Active Quotations"
          value={quotations.length}
          subtext="Proposals in pipeline"
          icon={FileCheck2}
          iconColor="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* Main Staff Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quotations Pipeline (With 1-Click Convert to Subscription) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Quotations Pipeline</h3>
              <p className="text-xs text-slate-500">Sales proposals ready for customer conversion</p>
            </div>
            <Link
              to="/quotations"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {quotations.map((quote) => (
              <div
                key={quote.id}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900 text-xs">{quote.customerCompany}</span>
                    <Badge status={quote.status} size="xs" />
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{quote.planName}</p>
                  <p className="text-[11px] text-slate-400">
                    Est. Value: <strong className="text-slate-700">${Number(quote.estimatedAmount).toFixed(2)}</strong> • Valid until {quote.validUntil}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {quote.status !== 'Accepted' ? (
                    <button
                      onClick={() => handleConvertQuote(quote.id)}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span>Convert to Sub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Converted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices Pending Collection */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Invoices Needing Action</h3>
              <p className="text-xs text-slate-500">Unpaid & overdue customer billing statements</p>
            </div>
            <Link
              to="/invoices"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Manage Invoices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {unpaidInvoices.length > 0 ? (
              unpaidInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900 text-xs">{inv.id}</span>
                      <Badge status={inv.status} size="xs" />
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">{inv.customerCompany || inv.customerName}</p>
                    <p className="text-[11px] text-slate-400">Due {inv.dueDate}</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="font-bold text-navy-900 text-sm mr-2">${Number(inv.totalAmount).toFixed(2)}</span>
                    
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600"
                      title="Preview Invoice"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setRecordPaymentModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Collect</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No pending invoices at the moment.</p>
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      <CreateSubscriptionModal
        isOpen={createSubModalOpen}
        onClose={() => setCreateSubModalOpen(false)}
      />

      <RecordPaymentModal
        isOpen={recordPaymentModalOpen}
        onClose={() => setRecordPaymentModalOpen(false)}
        selectedInvoice={selectedInvoice}
      />

      <InvoiceModal
        isOpen={Boolean(selectedInvoice) && !recordPaymentModalOpen}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        onRecordPayment={(inv) => {
          setSelectedInvoice(inv);
          setRecordPaymentModalOpen(true);
        }}
      />

    </div>
  );
}
