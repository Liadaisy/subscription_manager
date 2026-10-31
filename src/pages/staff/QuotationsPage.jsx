import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { FileCheck2, Plus, ArrowRight, CheckCircle2, Clock, Send, DollarSign } from 'lucide-react';

export default function QuotationsPage() {
  const { quotations, addQuotation, convertQuotationToSubscription, updateQuotationStatus, plans } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // New Quote Form
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [planName, setPlanName] = useState('Professional Growth Tier');
  const [amount, setAmount] = useState(1490);
  const [validUntil, setValidUntil] = useState('');

  const handleConvert = (quoteId) => {
    const res = convertQuotationToSubscription(quoteId);
    if (res) {
      setSuccessNotice(`Quotation converted! Created Subscription ${res.subscription.id} and Invoice ${res.invoice.id}.`);
      setTimeout(() => setSuccessNotice(''), 3500);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const date = new Date();
    date.setDate(date.getDate() + 30);

    addQuotation({
      customerCompany: company,
      customerName: name,
      customerEmail: email,
      planName,
      billingCycle: 'Yearly',
      estimatedAmount: Number(amount),
      validUntil: validUntil || date.toISOString().split('T')[0],
      notes: 'Standard proposal with annual enterprise terms.'
    });

    setCompany('');
    setName('');
    setEmail('');
    setIsModalOpen(false);
    setSuccessNotice('New quotation created and placed in pipeline!');
    setTimeout(() => setSuccessNotice(''), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Quotations & Proposals</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate enterprise quotes, deliver SLA proposals, and convert into active subscriptions in 1 click.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Quotations List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Quote Ref</th>
                <th className="py-3 px-4">Prospect Organization</th>
                <th className="py-3 px-4">Proposed Tier</th>
                <th className="py-3 px-4">Term & Cycle</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4 text-right">Estimated Quote</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                    {q.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{q.customerCompany}</p>
                    <p className="text-[11px] text-slate-500">{q.customerName} • {q.customerEmail}</p>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {q.planName}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {q.billingCycle || 'Yearly'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {q.validUntil}
                  </td>

                  <td className="py-3.5 px-4 text-right font-extrabold text-navy-900 text-sm">
                    ${Number(q.estimatedAmount).toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <Badge status={q.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {q.status !== 'Accepted' ? (
                      <button
                        onClick={() => handleConvert(q.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition-colors"
                      >
                        <span>Convert to Sub</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-bold text-xs flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Converted
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Quotation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Draft Sales Quotation"
        subtitle="Prepare a tailored pricing proposal for customer review"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Client Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Apex Global Systems"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus@apex.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proposed Subscription Tier
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g. Enterprise Scale (Custom SLA)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Value ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue Quotation</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
