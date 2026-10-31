import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import CreateSubscriptionModal from '../../components/subscriptions/CreateSubscriptionModal';
import { Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function CustomerPlansPage() {
  const { plans, subscriptions } = useData();
  const { user } = useAuth();

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  // Customer's current active sub
  const customerSub = subscriptions.find(
    s => (s.customerId === user?.customerId || s.customerEmail === user?.email) && s.status === 'Active'
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto pt-2 pb-4">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 mb-2">
          <Zap className="w-3.5 h-3.5 text-brand-600" />
          Flexible SaaS Scaling
        </span>
        <h1 className="text-3xl font-black text-navy-900 tracking-tight">Available Subscription Plans</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Upgrade your plan anytime or switch billing cycles to unlock higher team limits and dedicated SLA.
        </p>

        {/* Period Switcher */}
        <div className="flex justify-center mt-5">
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1.5 rounded-lg transition-colors ${
                billingPeriod === 'monthly' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                billingPeriod === 'yearly' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = customerSub && customerSub.planName.includes(plan.name);
          const price = billingPeriod === 'yearly' ? (plan.yearlyPrice ? Math.round(plan.yearlyPrice / 12) : plan.price * 0.8) : plan.price;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border ${
                isCurrentPlan 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                  : plan.popular 
                  ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md' 
                  : 'border-slate-200/80 shadow-xs'
              } flex flex-col justify-between p-6 relative`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-y-1/2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                    Current Active Plan
                  </span>
                </div>
              )}

              {plan.popular && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-y-1/2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-600 text-white shadow-xs">
                    Recommended
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-navy-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>

                <div className="my-5 pb-5 border-b border-slate-100">
                  <span className="text-3xl font-black text-navy-900">${price}</span>
                  <span className="text-xs text-slate-400 font-medium"> / month</span>
                  {billingPeriod === 'yearly' && (
                    <p className="text-[11px] text-emerald-600 font-medium mt-1">Billed annually (${plan.yearlyPrice || plan.price * 10}/yr)</p>
                  )}
                </div>

                <div className="space-y-2.5 mb-6">
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

              <div className="pt-4 border-t border-slate-100">
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default text-center"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedPlanId(plan.id)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <span>{customerSub ? 'Switch to this Tier' : 'Subscribe Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Modal */}
      <CreateSubscriptionModal
        isOpen={Boolean(selectedPlanId)}
        onClose={() => setSelectedPlanId(null)}
        preselectedPlan={selectedPlanId}
        preselectedCustomer={user?.customerId}
      />

    </div>
  );
}
