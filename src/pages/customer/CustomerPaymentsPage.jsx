import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CustomerPaymentsPage() {
  const { user } = useAuth();
  const { payments } = useData();

  const customerPayments = payments.filter(
    p => p.customerId === user?.customerId || p.customerName?.includes(user?.company || '')
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Payment Receipts & History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical record of all successful charges, bank transfers, and automated renewals.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Invoice Reference</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerPayments.length > 0 ? (
                customerPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">{pay.id}</td>
                    <td className="py-3.5 px-4 font-medium text-brand-600">{pay.invoiceId}</td>
                    <td className="py-3.5 px-4 text-slate-700">{pay.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-slate-500">{pay.paymentDate}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{pay.reference}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 text-sm">
                      +${Number(pay.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Captured</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No payment history recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
