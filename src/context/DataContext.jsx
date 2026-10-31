import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_PLANS,
  INITIAL_CUSTOMERS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_QUOTATIONS
} from '../data/initialData';

const DataContext = createContext();

const STORAGE_KEY = 'brightloop_data_store_v1';

export function DataProvider({ children }) {
  // Load initial state from localStorage or seed
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to parse localStorage data:', err);
    }
    return {
      plans: INITIAL_PLANS,
      customers: INITIAL_CUSTOMERS,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      invoices: INITIAL_INVOICES,
      payments: INITIAL_PAYMENTS,
      quotations: INITIAL_QUOTATIONS
    };
  });

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [data]);

  // Reset to seed data
  const resetDemoData = () => {
    const fresh = {
      plans: INITIAL_PLANS,
      customers: INITIAL_CUSTOMERS,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      invoices: INITIAL_INVOICES,
      payments: INITIAL_PAYMENTS,
      quotations: INITIAL_QUOTATIONS
    };
    setData(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  };

  // --- PLAN METHODS ---
  const addPlan = (newPlan) => {
    const plan = {
      id: `PLAN-00${data.plans.length + 1}`,
      subscribersCount: 0,
      status: 'Active',
      color: 'from-brand-600 to-purple-600',
      ...newPlan
    };
    setData(prev => ({
      ...prev,
      plans: [plan, ...prev.plans]
    }));
    return plan;
  };

  const updatePlan = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      plans: prev.plans.map(p => (p.id === id ? { ...p, ...updatedFields } : p))
    }));
  };

  const deletePlan = (id) => {
    setData(prev => ({
      ...prev,
      plans: prev.plans.filter(p => p.id !== id)
    }));
  };

  // --- CUSTOMER METHODS ---
  const addCustomer = (customerData) => {
    const customer = {
      id: `CUST-00${data.customers.length + 1}`,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      totalSpent: 0,
      ...customerData
    };
    setData(prev => ({
      ...prev,
      customers: [customer, ...prev.customers]
    }));
    return customer;
  };

  const updateCustomer = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.map(c => (c.id === id ? { ...c, ...updatedFields } : c))
    }));
  };

  // --- SUBSCRIPTION METHODS ---
  const addSubscription = (subData, autoGenerateInvoice = true) => {
    const subId = `SUB-${1000 + data.subscriptions.length + 1}`;
    const newSub = {
      id: subId,
      createdDate: new Date().toISOString().split('T')[0],
      autoRenew: true,
      status: 'Active',
      ...subData
    };

    let generatedInvoice = null;

    if (autoGenerateInvoice) {
      const taxRate = 10;
      const subtotal = Number(newSub.amount) || 0;
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));

      // Calculate 14 days due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      generatedInvoice = {
        id: `INV-2026-00${data.invoices.length + 1}`,
        subscriptionId: subId,
        customerId: newSub.customerId,
        customerName: newSub.customerName,
        customerCompany: newSub.customerCompany || newSub.customerName,
        customerEmail: newSub.customerEmail,
        customerAddress: newSub.customerAddress || 'Default billing address on file',
        items: [
          {
            description: `${newSub.planName} (${newSub.billingCycle} Subscription)`,
            quantity: 1,
            unitPrice: subtotal,
            amount: subtotal
          }
        ],
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        discountAmount: 0.00,
        totalAmount: totalAmount,
        paidAmount: 0.00,
        issueDate: newSub.startDate || new Date().toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'Unpaid',
        paymentMethod: 'Pending',
        notes: `Subscription generated automatically for cycle ${newSub.billingCycle}.`
      };
    }

    setData(prev => ({
      ...prev,
      subscriptions: [newSub, ...prev.subscriptions],
      invoices: generatedInvoice ? [generatedInvoice, ...prev.invoices] : prev.invoices
    }));

    return { subscription: newSub, invoice: generatedInvoice };
  };

  const updateSubscriptionStatus = (id, newStatus) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => (s.id === id ? { ...s, status: newStatus } : s))
    }));
  };

  // --- INVOICE METHODS ---
  const generateInvoiceFromSubscription = (subscription) => {
    const taxRate = 10;
    const subtotal = Number(subscription.amount) || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const newInvoice = {
      id: `INV-2026-00${data.invoices.length + 1}`,
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
      customerName: subscription.customerName,
      customerCompany: subscription.customerCompany,
      customerEmail: subscription.customerEmail,
      customerAddress: subscription.customerAddress || 'Default billing address',
      items: [
        {
          description: `${subscription.planName} (${subscription.billingCycle} Subscription)`,
          quantity: 1,
          unitPrice: subtotal,
          amount: subtotal
        }
      ],
      subtotal: subtotal,
      taxRate: taxRate,
      taxAmount: taxAmount,
      discountAmount: 0.00,
      totalAmount: totalAmount,
      paidAmount: 0.00,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'Unpaid',
      paymentMethod: 'Pending',
      notes: `Billing cycle renewal invoice for ${subscription.billingCycle}.`
    };

    setData(prev => ({
      ...prev,
      invoices: [newInvoice, ...prev.invoices]
    }));

    return newInvoice;
  };

  const createCustomInvoice = (invoiceData) => {
    const newInvoice = {
      id: `INV-2026-00${data.invoices.length + 1}`,
      paidAmount: 0.00,
      status: 'Unpaid',
      issueDate: new Date().toISOString().split('T')[0],
      ...invoiceData
    };

    setData(prev => ({
      ...prev,
      invoices: [newInvoice, ...prev.invoices]
    }));

    return newInvoice;
  };

  const updateInvoiceStatus = (id, newStatus) => {
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(inv => (inv.id === id ? { ...inv, status: newStatus } : inv))
    }));
  };

  // --- PAYMENT METHODS ---
  const recordPayment = (paymentData) => {
    const paymentId = `PAY-${9000 + data.payments.length + 1}`;
    const newPayment = {
      id: paymentId,
      status: 'Completed',
      isDemo: true,
      paymentDate: new Date().toISOString().split('T')[0],
      reference: paymentData.reference || `TXN-DEMO-${Math.floor(100000 + Math.random() * 900000)}`,
      ...paymentData
    };

    // Update corresponding invoice to 'Paid'
    const updatedInvoices = data.invoices.map(inv => {
      if (inv.id === paymentData.invoiceId) {
        return {
          ...inv,
          status: 'Paid',
          paidAmount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod
        };
      }
      return inv;
    });

    // Update customer's total spent
    const updatedCustomers = data.customers.map(c => {
      if (c.id === paymentData.customerId || c.email === paymentData.customerEmail) {
        return {
          ...c,
          totalSpent: Number((c.totalSpent + Number(paymentData.amount)).toFixed(2)),
          status: 'Active'
        };
      }
      return c;
    });

    // If subscription was Overdue, restore to Active
    const invoice = data.invoices.find(inv => inv.id === paymentData.invoiceId);
    let updatedSubscriptions = data.subscriptions;
    if (invoice && invoice.subscriptionId) {
      updatedSubscriptions = data.subscriptions.map(s => {
        if (s.id === invoice.subscriptionId && s.status === 'Overdue') {
          return { ...s, status: 'Active' };
        }
        return s;
      });
    }

    setData(prev => ({
      ...prev,
      payments: [newPayment, ...prev.payments],
      invoices: updatedInvoices,
      customers: updatedCustomers,
      subscriptions: updatedSubscriptions
    }));

    return newPayment;
  };

  // --- QUOTATION METHODS ---
  const addQuotation = (quotationData) => {
    const newQuote = {
      id: `QUO-${500 + data.quotations.length + 1}`,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      ...quotationData
    };
    setData(prev => ({
      ...prev,
      quotations: [newQuote, ...prev.quotations]
    }));
    return newQuote;
  };

  const updateQuotationStatus = (id, newStatus) => {
    setData(prev => ({
      ...prev,
      quotations: prev.quotations.map(q => (q.id === id ? { ...q, status: newStatus } : q))
    }));
  };

  // Convert Quotation into active subscription + invoice
  const convertQuotationToSubscription = (quoteId) => {
    const quote = data.quotations.find(q => q.id === quoteId);
    if (!quote) return;

    // Check if customer exists or create new
    let customer = data.customers.find(c => c.email === quote.customerEmail);
    if (!customer) {
      customer = addCustomer({
        name: quote.customerName,
        company: quote.customerCompany,
        email: quote.customerEmail,
        phone: '+1 (555) 000-0000',
        address: 'Quote registered address'
      });
    }

    // Match plan or use default
    const matchedPlan = data.plans.find(p => p.name.includes(quote.planName)) || data.plans[1];

    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const result = addSubscription({
      customerId: customer.id,
      customerName: customer.name,
      customerCompany: customer.company,
      customerEmail: customer.email,
      planId: matchedPlan.id,
      planName: quote.planName,
      amount: quote.estimatedAmount,
      billingCycle: quote.billingCycle || 'Yearly',
      startDate: today,
      expiryDate: nextYear.toISOString().split('T')[0],
      nextBillingDate: nextYear.toISOString().split('T')[0],
      status: 'Active'
    }, true);

    // Mark quote as Accepted
    updateQuotationStatus(quoteId, 'Accepted');

    return result;
  };

  // Computed dashboard KPIs
  const mrr = data.subscriptions
    .filter(s => s.status === 'Active')
    .reduce((acc, sub) => {
      const amt = Number(sub.amount) || 0;
      if (sub.billingCycle === 'Monthly') return acc + amt;
      if (sub.billingCycle === 'Yearly') return acc + Math.round(amt / 12);
      if (sub.billingCycle === 'Weekly') return acc + Math.round(amt * 4.33);
      if (sub.billingCycle === 'Daily') return acc + Math.round(amt * 30);
      return acc + amt;
    }, 0);

  const activeSubscriptionsCount = data.subscriptions.filter(s => s.status === 'Active').length;
  const pendingInvoicesCount = data.invoices.filter(i => i.status === 'Unpaid').length;
  const overdueInvoicesCount = data.invoices.filter(i => i.status === 'Overdue').length;
  const overdueAmount = data.invoices
    .filter(i => i.status === 'Overdue')
    .reduce((acc, i) => acc + (Number(i.totalAmount) - Number(i.paidAmount || 0)), 0);

  const totalCollectedRevenue = data.payments.reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <DataContext.Provider
      value={{
        plans: data.plans,
        customers: data.customers,
        subscriptions: data.subscriptions,
        invoices: data.invoices,
        payments: data.payments,
        quotations: data.quotations,
        // Computed
        mrr,
        activeSubscriptionsCount,
        pendingInvoicesCount,
        overdueInvoicesCount,
        overdueAmount,
        totalCollectedRevenue,
        // Methods
        addPlan,
        updatePlan,
        deletePlan,
        addCustomer,
        updateCustomer,
        addSubscription,
        updateSubscriptionStatus,
        generateInvoiceFromSubscription,
        createCustomInvoice,
        updateInvoiceStatus,
        recordPayment,
        addQuotation,
        updateQuotationStatus,
        convertQuotationToSubscription,
        resetDemoData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
