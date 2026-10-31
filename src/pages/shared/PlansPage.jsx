import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PlanModal from '../../components/plans/PlanModal';
import CreateSubscriptionModal from '../../components/subscriptions/CreateSubscriptionModal';
import { Layers, Plus, Check, Edit2, Trash2, Sparkles, Users } from 'lucide-react';

export default function PlansPage() {
  const { plans, deletePlan } = useData();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [subscribeModalPlan, setSubscribeModalPlan] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'yearly'

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = (planId) => {
    if (user?.role !== 'admin') {
      alert('Only administrators have permissions to delete pricing tiers.');
      return;
    }
    if (window.confirm('Are you sure you want to retire this plan?')) {
      deletePlan(planId);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Subscription Plans & Tiers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure recurring tiers, seat allocations, billing cycles, and feature matrices.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setEditingPlan(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        )}
      </div>

      {/* Interval Toggle */}
      <div className="flex justify-center">
        <div className="bg-slate-200/80 p-1 rounded-xl flex items-center text-xs font-semibold">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              billingPeriod === 'monthly' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              billingPeriod === 'yearly' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const displayPrice = billingPeriod === 'yearly' ? (plan.yearlyPrice ? Math.round(plan.yearlyPrice / 12) : plan.price * 0.8) : plan.price;
          const billingLabel = billingPeriod === 'yearly' ? '/month (billed annually)' : '/month';

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border ${
                plan.popular ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-lg' : 'border-slate-200/80 shadow-xs'
              } flex flex-col justify-between p-6 relative transition-all hover:shadow-md`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-navy-900">{plan.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                    {plan.id}
                  </span>
                </div>

                <p className="text-xs text-slate-500 min-h-[32px]">{plan.description}</p>

                <div className="my-5 pb-5 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-navy-900">${displayPrice}</span>
                    <span className="text-xs text-slate-400 font-medium">{billingLabel}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{plan.subscribersCount || 0} active subscriptions</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-6">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Features Included</p>
                  {plan.features?.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => setSubscribeModalPlan(plan.id)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors text-center"
                >
                  Provision Customer to Tier
                </button>

                {user?.role === 'admin' && (
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-slate-500 hover:text-brand-600 font-medium flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Plan</span>
                    </button>

                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Retire</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Plan Modal */}
      <PlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingPlan={editingPlan}
      />

      {/* Quick Provision Subscription Modal */}
      <CreateSubscriptionModal
        isOpen={Boolean(subscribeModalPlan)}
        onClose={() => setSubscribeModalPlan(null)}
        preselectedPlan={subscribeModalPlan}
      />

    </div>
  );
}
