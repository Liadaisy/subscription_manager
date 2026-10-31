import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { Printer, Download, CreditCard, Sparkles, Building, Mail, MapPin, Calendar, FileText } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose, invoice, onRecordPayment }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Trigger print dialog (which allows Save as PDF in all modern browsers)
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice Preview – ${invoice.id}`}
      subtitle="Official itemized tax invoice document"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        
        {/* Action Header Bar (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl no-print">
          <div className="flex items-center gap-2">
            <Badge status={invoice.status} size="sm" />
            <span className="text-xs text-slate-500">
              Payment Status: <strong className="text-slate-800 capitalize">{invoice.status}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download PDF</span>
            </button>

            {invoice.status !== 'Paid' && onRecordPayment && (
              <button
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}
          </div>
        </div>

        {/* Printable Document Container */}
        <div id="printable-invoice" className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm text-slate-800">
          
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-base">
                  B
                </div>
                <span className="text-xl font-extrabold text-navy-900 tracking-tight">
                  Bright<span className="text-brand-600">loop</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Brightloop Technologies Inc.</p>
              <p className="text-xs text-slate-500">101 SaaS Parkway, Suite 500, Cloud City, CA</p>
              <p className="text-xs text-slate-500">support@brightloop.com • Tax ID: US-EIN-9908123</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-extrabold tracking-widest uppercase text-brand-600">INVOICE</span>
              <h2 className="text-xl font-black text-navy-900 tracking-tight mt-0.5">{invoice.id}</h2>
              <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                <p>Issue Date: <strong className="text-slate-800">{invoice.issueDate}</strong></p>
                <p>Due Date: <strong className="text-slate-800">{invoice.dueDate}</strong></p>
                {invoice.subscriptionId && (
                  <p>Subscription Ref: <strong className="text-slate-800">{invoice.subscriptionId}</strong></p>
                )}
              </div>
            </div>
          </div>

          {/* Billed To / Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
            <div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To
              </span>
              <h4 className="text-sm font-bold text-navy-900">{invoice.customerCompany || invoice.customerName}</h4>
              <p className="text-slate-600 font-medium">{invoice.customerName}</p>
              <p className="text-slate-500 mt-1">{invoice.customerAddress || 'Billing Address On File'}</p>
              <p className="text-slate-500">{invoice.customerEmail}</p>
            </div>

            <div className="sm:text-right">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Payment Details
              </span>
              <div className="inline-block sm:text-right">
                <p className="text-slate-600">Payment Status: <strong className="capitalize text-slate-800">{invoice.status}</strong></p>
                <p className="text-slate-600">Payment Method: <span className="text-slate-800">{invoice.paymentMethod || 'Credit Card / Bank Transfer'}</span></p>
                {invoice.status === 'Paid' && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs uppercase tracking-wider">
                    ✓ Paid in Full
                  </div>
                )}
                {invoice.status === 'Overdue' && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs uppercase tracking-wider">
                    ⚠ Payment Overdue
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6 border-b border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 w-1/2">Item Description</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-medium text-slate-800">{item.description}</td>
                      <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-600">${Number(item.unitPrice).toFixed(2)}</td>
                      <td className="py-3 text-right font-semibold text-slate-800">${Number(item.amount).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 font-medium text-slate-800">SaaS Subscription Plan Fee</td>
                    <td className="py-3 text-center text-slate-600">1</td>
                    <td className="py-3 text-right text-slate-600">${Number(invoice.subtotal).toFixed(2)}</td>
                    <td className="py-3 text-right font-semibold text-slate-800">${Number(invoice.subtotal).toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Subtotal, Tax, Discount, Total */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4">
            <div className="text-xs text-slate-500 max-w-sm">
              <p className="font-semibold text-slate-700 mb-1">Notes & Instructions:</p>
              <p>{invoice.notes || 'Please pay within 14 days of invoice issue date. Electronic bank transfers and card payments are accepted.'}</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-800">${Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax ({invoice.taxRate || 10}% Standard):</span>
                <span className="font-medium text-slate-800">${Number(invoice.taxAmount || 0).toFixed(2)}</span>
              </div>
              {Number(invoice.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount Applied:</span>
                  <span className="font-medium">-${Number(invoice.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-navy-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-brand-600">${Number(invoice.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <span>Amount Paid:</span>
                <span className="font-semibold text-slate-700">${Number(invoice.paidAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </Modal>
  );
}
