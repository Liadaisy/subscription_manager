import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import CreateSubscriptionModal from '../../components/subscriptions/CreateSubscriptionModal';
import { Users, Search, Plus, Mail, Phone, MapPin, Building, Repeat, CheckCircle } from 'lucide-react';

export default function CustomersPage() {
  const { customers, addCustomer } = useData();

  const [search, setSearch] = useState('');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [subModalCustomer, setSubModalCustomer] = useState(null);

  // New Customer Form
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      return (
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [customers, search]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    addCustomer({
      name,
      company: company || name,
      email,
      phone: phone || '+1 (555) 000-0000',
      address: address || '100 Business Parkway'
    });

    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setAddress('');
    setIsAddCustomerOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Customer Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain verified customer directories, company profiles, and billing histories.
          </p>
        </div>

        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, company, email..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Showing {filteredCustomers.length} accounts
        </span>
      </div>

      {/* Customer Directory Cards/Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Contact & Company</th>
                <th className="py-3 px-4">Communication</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Lifetime Billing</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                    {cust.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{cust.company}</p>
                    <p className="text-[11px] text-slate-500">{cust.name}</p>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{cust.email}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{cust.phone}</span>
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    <p className="truncate max-w-[160px]">{cust.address}</p>
                    <p className="text-[11px] text-slate-400">{cust.city ? `${cust.city}, ${cust.state}` : 'On file'}</p>
                  </td>

                  <td className="py-3.5 px-4 text-right font-extrabold text-navy-900 text-sm">
                    ${Number(cust.totalSpent || 0).toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <Badge status={cust.status || 'Active'} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSubModalCustomer(cust.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs transition-colors"
                    >
                      <Repeat className="w-3 h-3" />
                      <span>Assign Sub</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        title="Add Customer Account"
        subtitle="Register a new commercial or direct individual subscriber"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rachel Adams"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Organization
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Vanguard Logistics Inc."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@vanguard.io"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Billing Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Suite 500, 200 Enterprise Way"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Register Customer</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Subscription for selected customer */}
      <CreateSubscriptionModal
        isOpen={Boolean(subModalCustomer)}
        onClose={() => setSubModalCustomer(null)}
        preselectedCustomer={subModalCustomer}
      />

    </div>
  );
}
