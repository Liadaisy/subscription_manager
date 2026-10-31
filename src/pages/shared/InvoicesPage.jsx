import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import InvoiceModal from '../../components/invoices/InvoiceModal';
import RecordPaymentModal from '../../components/payments/RecordPaymentModal';
import Modal from '../../components/common/Modal';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Printer,
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';

export default function InvoicesPage() {
  const { invoices, createCustomInvoice, customers } = useData();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Invoice Form State
  const [newCustId, setNewCustId] = useState('');
  const [itemDesc, setItemDesc] = useState('Dedicated Cloud Workspace Setup');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(250);
  const [taxRate, setTaxRate] = useState(10);
  const [discount, setDiscount] = useState(0);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (user?.role === 'customer') {
        if (inv.customerId !== user.customerId && inv.customerEmail !== user.email) {
          return false;
        }
      }

      const matchSearch =
        inv.id.toLowerCase().includes(search.toLowerCase()) ||
        (inv.customerCompany || '').toLowerCase().includes(search.toLowerCase()) ||
        (inv.customerName || '').toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || inv.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter, user]);

  const handleCreateCustomInvoice = (e) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === newCustId) || customers[0];
    const subtotal = Number(itemQty) * Number(itemPrice);
    const taxAmt = (subtotal * Number(taxRate)) / 100;
    const total = subtotal + taxAmt - Number(discount);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    createCustomInvoice({
      customerId: cust.id,
      customerName: cust.name,
      customerCompany: cust.company,
      customerEmail: cust.email,
      customerAddress: cust.address,
      items: [
        {
          description: itemDesc,
          quantity: Number(itemQty),
          unitPrice: Number(itemPrice),
          amount: subtotal
        }
      ],
      subtotal: subtotal,
      taxRate: Number(taxRate),
      taxAmount: taxAmt,
      discountAmount: Number(discount),
      totalAmount: total,
      dueDate: dueDate.toISOString().split('T')[0],
      notes: 'Custom generated statement for technical onboarding & add-on services.'
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Invoice Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official itemized tax receipts, automated subscription billings, and payment reconciliations.
          </p>
        </div>

        {user?.role !== 'customer' && (
          <button
            onClick={() => {
              setNewCustId(customers[0]?.id || '');
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice number, client..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {['All', 'Paid', 'Unpaid', 'Overdue'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === st ? 'bg-white text-navy-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Tax (10%)</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                      {inv.id}
                      {inv.subscriptionId && (
                        <span className="block text-[10px] font-normal text-slate-400">
                          {inv.subscriptionId}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{inv.customerCompany || inv.customerName}</p>
                      <p className="text-[11px] text-slate-400">{inv.customerEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {inv.issueDate}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {inv.dueDate}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-500 font-medium">
                      ${Number(inv.taxAmount || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-navy-900 text-sm">
                      ${Number(inv.totalAmount).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge status={inv.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          title="View / Print Invoice"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Preview</span>
                        </button>

                        {inv.status !== 'Paid' && user?.role !== 'customer' && (
                          <button
                            onClick={() => setPaymentInvoice(inv)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            title="Record Payment for this invoice"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Collect</span>
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No invoices matching the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      <InvoiceModal
        isOpen={Boolean(previewInvoice)}
        onClose={() => setPreviewInvoice(null)}
        invoice={previewInvoice}
        onRecordPayment={(inv) => {
          setPaymentInvoice(inv);
        }}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={Boolean(paymentInvoice)}
        onClose={() => setPaymentInvoice(null)}
        selectedInvoice={paymentInvoice}
      />

      {/* Create Custom Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate Custom Invoice"
        subtitle="Issue an ad-hoc billing invoice with custom line items"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateCustomInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Customer <span className="text-rose-500">*</span>
            </label>
            <select
              value={newCustId}
              onChange={(e) => setNewCustId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Item Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={itemQty}
                onChange={(e) => setItemQty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Price ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Issue Invoice</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
