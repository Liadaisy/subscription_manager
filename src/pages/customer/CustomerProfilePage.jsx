import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { User, Building, Mail, MapPin, Shield, CheckCircle2, Save } from 'lucide-react';

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const { customers, updateCustomer } = useData();

  const customerRecord = customers.find(c => c.id === user?.customerId) || {
    name: user?.name || 'David Miller',
    company: user?.company || 'Acme Corporation',
    email: user?.email || 'customer@acme.com',
    phone: '+1 (555) 234-5678',
    address: '100 Silicon Blvd, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    taxId: 'US-EIN-9921827'
  };

  const [company, setCompany] = useState(customerRecord.company);
  const [address, setAddress] = useState(customerRecord.address);
  const [phone, setPhone] = useState(customerRecord.phone);
  const [taxId, setTaxId] = useState(customerRecord.taxId);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (user?.customerId) {
      updateCustomer(user.customerId, {
        company,
        address,
        phone,
        taxId
      });
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Organization Profile & Billing Info</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update company credentials, legal tax identification, and billing contacts.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile and billing information successfully updated!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: User Account */}
          <div>
            <h3 className="text-sm font-bold text-navy-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Primary Account Holder</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={customerRecord.name}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={customerRecord.email}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Organization & Tax */}
          <div>
            <h3 className="text-sm font-bold text-navy-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-600" />
              <span>Organization & Legal Entity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax ID / EIN</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile Information</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
