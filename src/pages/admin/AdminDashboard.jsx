import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import PlanModal from '../../components/plans/PlanModal';
import InvoiceModal from '../../components/invoices/InvoiceModal';
import CreateSubscriptionModal from '../../components/subscriptions/CreateSubscriptionModal';
import {
  Users,
  Repeat,
  DollarSign,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Eye,
  CreditCard,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { MONTHLY_REVENUE_DATA, PLAN_DISTRIBUTION_DATA } from '../../data/initialData';

export default function AdminDashboard() {
  const {
    customers,
    subscriptions,
    invoices,
    payments,
    mrr,
    activeSubscriptionsCount,
    pendingInvoicesCount,
    overdueInvoicesCount,
    overdueAmount
  } = useData();

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Compute total ARR
  const arr = mrr * 12;

  // Recent 5 transactions
  const recentPayments = payments.slice(0, 5);

  // Recent 5 subscriptions
  const recentSubscriptions = subscriptions.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Admin Executive Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time MRR, recurring metrics, invoice health, and subscription growth telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4 text-brand-600" />
            <span>+ Create Plan</span>
          </button>
          
          <button
            onClick={() => setIsSubModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Subscription</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* MRR */}
        <StatCard
          title="Monthly Rec. Rev"
          value={`$${mrr.toLocaleString()}`}
          subtext={`ARR ~$${(arr / 1000).toFixed(1)}k`}
          trend="+18.4%"
          trendPositive={true}
          icon={DollarSign}
          iconColor="bg-emerald-50 text-emerald-600"
          accentBorder="border-l-4 border-l-emerald-500"
        />

        {/* Active Subscriptions */}
        <StatCard
          title="Active Subs"
          value={activeSubscriptionsCount}
          subtext={`out of ${subscriptions.length} total`}
          trend="+4 this wk"
          trendPositive={true}
          icon={Repeat}
          iconColor="bg-brand-50 text-brand-600"
          accentBorder="border-l-4 border-l-brand-500"
        />

        {/* Total Customers */}
        <StatCard
          title="Total Customers"
          value={customers.length}
          subtext="100% enterprise retention"
          trend="+3 this mo"
          trendPositive={true}
          icon={Users}
          iconColor="bg-blue-50 text-blue-600"
          accentBorder="border-l-4 border-l-blue-500"
        />

        {/* Pending Invoices */}
        <StatCard
          title="Pending Invoices"
          value={pendingInvoicesCount}
          subtext="Awaiting clearance"
          icon={Clock}
          iconColor="bg-amber-50 text-amber-600"
          accentBorder="border-l-4 border-l-amber-500"
        />

        {/* Overdue Payments */}
        <StatCard
          title="Overdue Invoices"
          value={overdueInvoicesCount}
          subtext={`$${overdueAmount.toFixed(0)} overdue balance`}
          trend={overdueInvoicesCount > 0 ? "Requires action" : "Clean"}
          trendPositive={overdueInvoicesCount === 0}
          icon={AlertCircle}
          iconColor="bg-rose-50 text-rose-600"
          accentBorder="border-l-4 border-l-rose-500"
        />

      </div>

      {/* Charts Row: Revenue Growth & Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Area Chart: Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Revenue Growth & Recurring Trajectory</h3>
              <p className="text-xs text-slate-500">Monthly billing vs base recurring subscription volume ($)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              +42% Growth YTD
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="recurring" name="Base Recurring" stroke="#0EA5E9" strokeWidth={2} fillOpacity={1} fill="url(#colorRec)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Plan Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-navy-900">Subscription Tier Distribution</h3>
            <p className="text-xs text-slate-500">Active customer distribution across SaaS tiers</p>
          </div>

          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PLAN_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {PLAN_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Subscribers`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            {PLAN_DISTRIBUTION_DATA.map((item, idx) => (
              <div key={idx} className="p-1.5 rounded-lg bg-slate-50">
                <span className="inline-block w-2 h-2 rounded-full mb-1" style={{ backgroundColor: item.color }} />
                <p className="text-[10px] text-slate-500 truncate">{item.name}</p>
                <p className="text-xs font-bold text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tables Row: Recent Transactions & Active Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Recent Payment Transactions</h3>
              <p className="text-xs text-slate-500">Live ledger of captured payments and references</p>
            </div>
            <Link
              to="/payments"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="pb-2.5">Receipt ID</th>
                  <th className="pb-2.5">Customer</th>
                  <th className="pb-2.5">Method</th>
                  <th className="pb-2.5 text-right">Amount</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 font-medium text-navy-900">{pay.id}</td>
                    <td className="py-2.5 text-slate-600 truncate max-w-[140px]">{pay.customerName}</td>
                    <td className="py-2.5 text-slate-500">{pay.paymentMethod}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-600">+${Number(pay.amount).toFixed(2)}</td>
                    <td className="py-2.5 text-right">
                      <Badge status="completed" label="Success" size="xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Subscriptions Stream */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Active Subscriptions</h3>
              <p className="text-xs text-slate-500">Current provisioned subscriptions and renewal dates</p>
            </div>
            <Link
              to="/subscriptions"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="pb-2.5">Subscription</th>
                  <th className="pb-2.5">Plan / Cycle</th>
                  <th className="pb-2.5">Renewal</th>
                  <th className="pb-2.5 text-right">Rate</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5">
                      <p className="font-semibold text-navy-900">{sub.customerCompany || sub.customerName}</p>
                      <p className="text-[11px] text-slate-400">{sub.id}</p>
                    </td>
                    <td className="py-2.5 text-slate-600">
                      <p className="font-medium text-slate-800">{sub.planName}</p>
                      <p className="text-[11px] text-slate-400">{sub.billingCycle}</p>
                    </td>
                    <td className="py-2.5 text-slate-500">{sub.expiryDate}</td>
                    <td className="py-2.5 text-right font-bold text-slate-800">${Number(sub.amount).toFixed(2)}</td>
                    <td className="py-2.5 text-right">
                      <Badge status={sub.status} size="xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modals */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />

      <CreateSubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
      />

      <InvoiceModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />

    </div>
  );
}
