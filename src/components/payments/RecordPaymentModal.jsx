import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../common/Modal';
import { CreditCard, CheckCircle2, ShieldCheck, DollarSign, Calendar, Info } from 'lucide-react';

export default function RecordPaymentModal({ isOpen, onClose, selectedInvoice = null }) {
  const { invoices, recordPayment } = useData();

  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('Manual payment recorded by staff');
  const [success, setSuccess] = useState(false);

  // Filter to unpaid or overdue invoices
  const pendingInvoices = invoices.filter(inv => inv.status !== 'Paid');

  useEffect(() => {
    if (isOpen) {
      const activeInvoice = selectedInvoice || pendingInvoices[0] || invoices[0];
      if (activeInvoice) {
        setInvoiceId(activeInvoice.id);
        const remaining = Number(activeInvoice.totalAmount) - Number(activeInvoice.paidAmount || 0);
        setAmount(remaining > 0 ? remaining.toFixed(2) : activeInvoice.totalAmount.toFixed(2));
      }
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setReference(`TXN-MANUAL-${Math.floor(100000 + Math.random() * 900000)}`);
      setSuccess(false);
    }
  }, [isOpen, selectedInvoice, invoices]);

  // When invoice selection changes, update amount
  const handleInvoiceChange = (id) => {
    setInvoiceId(id);
    const target = invoices.find(inv => inv.id === id);
    if (target) {
      const remaining = Number(target.totalAmount) - Number(target.paidAmount || 0);
      setAmount(remaining > 0 ? remaining.toFixed(2) : target.totalAmount.toFixed(2));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) {
      alert('Please select an invoice');
      return;
    }

    recordPayment({
      invoiceId,
      customerId: inv.customerId,
      customerName: `${inv.customerName} (${inv.customerCompany || 'Direct'})`,
      customerEmail: inv.customerEmail,
      amount: Number(amount),
      paymentMethod,
      paymentDate,
      reference,
      note,
      status: 'Completed',
      isDemo: true
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      subtitle="Log incoming customer payment against an existing invoice"
      maxWidth="max-w-lg"
    >
      {success ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-navy-900 mb-1">Payment Successfully Recorded!</h4>
          <p className="text-sm text-slate-600">Invoice {invoiceId} is now marked as Paid.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Demo distinction banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Demo Simulation Notice</p>
              <p className="text-[11px] text-amber-800">
                This form simulates offline/manual payment recording (wire, cash, external POS). No actual bank charge occurs.
              </p>
            </div>
          </div>

          {/* Select Invoice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Invoice Reference <span className="text-rose-500">*</span>
            </label>
            <select
              value={invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              required
            >
              <option value="">-- Choose Invoice --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.id} — {inv.customerCompany || inv.customerName} (${Number(inv.totalAmount).toFixed(2)}) [{inv.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount Received ($) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                <option value="UPI / QR Code">UPI / Instant Pay</option>
                <option value="PayPal">PayPal</option>
                <option value="Cash / Cheque">Cash / Cheque</option>
              </select>
            </div>

            {/* Transaction Reference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaction / Receipt Ref
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="TXN-88219"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Note / Remarks
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Confirm & Record Payment</span>
            </button>
          </div>

        </form>
      )}
    </Modal>
  );
}
