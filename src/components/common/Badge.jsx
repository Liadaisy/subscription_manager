import React from 'react';

const BADGE_STYLES = {
  // Subscriptions & general status
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  canceled: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  expired: 'bg-rose-50 text-rose-700 border-rose-200',
  delinquent: 'bg-rose-50 text-rose-700 border-rose-200',

  // Invoices & Payments
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  unpaid: 'bg-blue-50 text-blue-700 border-blue-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',

  // Quotations
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  sent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  // Roles
  admin: 'bg-purple-100 text-purple-800 border-purple-200 font-medium',
  staff: 'bg-blue-100 text-blue-800 border-blue-200 font-medium',
  customer: 'bg-teal-100 text-teal-800 border-teal-200 font-medium'
};

export default function Badge({ status, label, size = 'sm' }) {
  const normalized = (status || '').toString().toLowerCase().trim();
  const style = BADGE_STYLES[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        ['active', 'paid', 'completed', 'accepted'].includes(normalized) ? 'bg-emerald-500' :
        ['paused', 'pending'].includes(normalized) ? 'bg-amber-500' :
        ['overdue', 'expired', 'failed', 'delinquent'].includes(normalized) ? 'bg-rose-500' :
        'bg-slate-400'
      }`} />
      {label || status}
    </span>
  );
}
