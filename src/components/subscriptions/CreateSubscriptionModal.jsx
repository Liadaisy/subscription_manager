import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../common/Modal';
import { Sparkles, Calendar, DollarSign, User, Layers, CheckCircle } from 'lucide-react';

export default function CreateSubscriptionModal({ isOpen, onClose, preselectedCustomer = null, preselectedPlan = null }) {
  const { customers, plans, addSubscription } = useData();

  const [customerId, setCustomerId] = useState('');
  const [planId, setPlanId] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [autoGenerateInvoice, setAutoGenerateInvoice] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Synchronize defaults on open
  useEffect(() => {
    if (isOpen) {
      const activeCust = preselectedCustomer || customers[0]?.id || '';
      const activePlan = preselectedPlan || plans[1]?.id || plans[0]?.id || '';
      setCustomerId(activeCust);
      setPlanId(activePlan);
      setBillingCycle('Monthly');
      setStartDate(new Date().toISOString().split('T')[0]);
      setSuccessMessage('');
    }
  }, [isOpen, preselectedCustomer, preselectedPlan, customers, plans]);

  // Recalculate expiry date and price when plan or billingCycle changes
  useEffect(() => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;

    // Price setting
    if (billingCycle === 'Yearly') {
      setCustomPrice(selectedPlan.yearlyPrice || selectedPlan.price * 10);
    } else if (billingCycle === 'Weekly') {
      setCustomPrice(Math.round(selectedPlan.price / 3.5));
    } else if (billingCycle === 'Daily') {
      setCustomPrice(Math.round(selectedPlan.price / 25));
    } else {
      setCustomPrice(selectedPlan.price);
    }

    // Auto-calculate expiry date
    if (startDate) {
      const d = new Date(startDate);
      if (billingCycle === 'Daily') d.setDate(d.getDate() + 1);
      else if (billingCycle === 'Weekly') d.setDate(d.getDate() + 7);
      else if (billingCycle === 'Monthly') d.setMonth(d.getMonth() + 1);
      else if (billingCycle === 'Yearly') d.setFullYear(d.getFullYear() + 1);
      setExpiryDate(d.toISOString().split('T')[0]);
    }
  }, [planId, billingCycle, startDate, plans]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === customerId);
    const plan = plans.find(p => p.id === planId);

    if (!customer || !plan) {
      alert('Please select both a valid customer and a subscription plan.');
      return;
    }

    const result = addSubscription({
      customerId: customer.id,
      customerName: customer.name,
      customerCompany: customer.company,
      customerEmail: customer.email,
      customerAddress: customer.address,
      planId: plan.id,
      planName: plan.name,
      amount: Number(customPrice),
      billingCycle,
      startDate,
      expiryDate,
      nextBillingDate: expiryDate,
      status: 'Active'
    }, autoGenerateInvoice);

    setSuccessMessage(`Subscription ${result.subscription.id} created successfully! ${autoGenerateInvoice ? `Invoice ${result.invoice.id} generated.` : ''}`);
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Subscription"
      subtitle="Provision a subscription tier for an existing or new customer"
      maxWidth="max-w-2xl"
    >
      {successMessage ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-navy-900 mb-1">Subscription Activated!</h4>
          <p className="text-sm text-slate-600">{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Customer <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Plan Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subscription Plan <span className="text-rose-500">*</span>
              </label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              >
                <option value="">-- Choose Plan --</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ${p.price}/mo
                  </option>
                ))}
              </select>
            </div>

            {/* Billing Cycle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Billing Cycle <span className="text-rose-500">*</span>
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly (Annual Discount)</option>
              </select>
            </div>

            {/* Recurring Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (${billingCycle}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              />
            </div>

            {/* Expiry / Renewal Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiry / Next Renewal Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              />
            </div>

          </div>

          {/* Invoice Generation Toggle */}
          <div className="p-3 bg-brand-50/70 border border-brand-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-brand-900">Auto-Generate First Billing Invoice</p>
              <p className="text-[11px] text-brand-700">Creates an itemized invoice with 10% standard tax ready for payment.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerateInvoice}
                onChange={(e) => setAutoGenerateInvoice(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Subscription</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
