import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Badge from '../../components/common/Badge';
import InvoiceModal from '../../components/invoices/InvoiceModal';
import { FileText, Eye, Printer, Download } from 'lucide-react';

export default function CustomerInvoicesPage() {
  const { user } = useAuth();
  const { invoices } = useData();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const customerInvoices = invoices.filter(
    i => i.customerId === user?.customerId || i.customerEmail === user?.email
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">My Invoices & Tax Receipts</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review previous payment statements, print official tax receipts, or export PDF copies.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Tax</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerInvoices.length > 0 ? (
                customerInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">{inv.id}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {inv.items?.[0]?.description || 'Recurring Subscription'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.issueDate}</td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.dueDate}</td>
                    <td className="py-3.5 px-4 text-right text-slate-500 font-medium">${Number(inv.taxAmount || 0).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-navy-900 text-sm">${Number(inv.totalAmount).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge status={inv.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-600" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No invoices generated yet for this account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InvoiceModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
