export const INITIAL_USERS = [
  {
    id: 'user-admin',
    name: 'Alex Morgan',
    email: 'admin@brightloop.com',
    password: 'admin',
    role: 'admin',
    title: 'Operations Director',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-staff',
    name: 'Sarah Chen',
    email: 'staff@brightloop.com',
    password: 'staff',
    role: 'staff',
    title: 'Billing Specialist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-customer',
    name: 'David Miller',
    email: 'customer@acme.com',
    password: 'customer',
    role: 'customer',
    title: 'CTO at Acme Corp',
    customerId: 'CUST-001',
    company: 'Acme Corporation',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  }
];

export const INITIAL_PLANS = [
  {
    id: 'PLAN-001',
    name: 'Starter Cloud',
    code: 'starter',
    description: 'Perfect for small teams and fast-growing startups',
    price: 49,
    yearlyPrice: 490,
    cycle: 'Monthly',
    popular: false,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Up to 5 Team Members',
      '50 GB Cloud Storage',
      'Basic Analytics & Reporting',
      'Email Support (24h response)',
      'Community Access'
    ],
    status: 'Active',
    subscribersCount: 28
  },
  {
    id: 'PLAN-002',
    name: 'Professional Growth',
    code: 'pro',
    description: 'Designed for scaling companies needing workflow automation',
    price: 149,
    yearlyPrice: 1490,
    cycle: 'Monthly',
    popular: true,
    color: 'from-brand-600 to-purple-600',
    features: [
      'Up to 25 Team Members',
      '500 GB High-Speed Storage',
      'Real-time Advanced Metrics',
      'Priority Support (2h response)',
      'Custom Webhooks & Integrations',
      'Audit Logs & Role Permissions'
    ],
    status: 'Active',
    subscribersCount: 45
  },
  {
    id: 'PLAN-003',
    name: 'Enterprise Scale',
    code: 'enterprise',
    description: 'Mission-critical security, unlimited volume, and dedicated SLA',
    price: 499,
    yearlyPrice: 4990,
    cycle: 'Monthly',
    popular: false,
    color: 'from-navy-800 to-indigo-900',
    features: [
      'Unlimited Team Members',
      '2 TB Dedicated Storage',
      '99.99% Uptime Guarantee SLA',
      'Dedicated Account Manager',
      'Custom API & SSO / SAML',
      'Custom Invoicing & PO Support'
    ],
    status: 'Active',
    subscribersCount: 14
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-001',
    name: 'David Miller',
    company: 'Acme Corporation',
    email: 'customer@acme.com',
    phone: '+1 (555) 234-5678',
    address: '100 Silicon Blvd, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    taxId: 'US-EIN-9921827',
    joinedDate: '2026-01-15',
    status: 'Active',
    totalSpent: 1640.00
  },
  {
    id: 'CUST-002',
    name: 'Elena Rostova',
    company: 'NovaWave Labs',
    email: 'elena@novawave.io',
    phone: '+1 (555) 892-1204',
    address: '450 Tech Park Way',
    city: 'Austin',
    state: 'TX',
    country: 'United States',
    taxId: 'US-EIN-7729103',
    joinedDate: '2026-02-20',
    status: 'Active',
    totalSpent: 5289.00
  },
  {
    id: 'CUST-003',
    name: 'Marcus Vance',
    company: 'Apex Logistics',
    email: 'marcus@apexlog.com',
    phone: '+1 (555) 671-8899',
    address: '78 Cargo Way, Terminal 4',
    city: 'Chicago',
    state: 'IL',
    country: 'United States',
    taxId: 'US-EIN-5519284',
    joinedDate: '2026-03-10',
    status: 'Delinquent',
    totalSpent: 294.00
  },
  {
    id: 'CUST-004',
    name: 'Dr. Aisha Khan',
    company: 'Lumina Health Systems',
    email: 'aisha@lumina.org',
    phone: '+1 (555) 441-2980',
    address: '880 Medical Plaza',
    city: 'Boston',
    state: 'MA',
    country: 'United States',
    taxId: 'US-EIN-3391024',
    joinedDate: '2026-04-05',
    status: 'Active',
    totalSpent: 890.00
  },
  {
    id: 'CUST-005',
    name: 'Liam O\'Connor',
    company: 'Quantum Retail Group',
    email: 'liam@quantumretail.com',
    phone: '+1 (555) 302-8871',
    address: '12 Fashion Ave',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    taxId: 'US-EIN-8819200',
    joinedDate: '2026-05-12',
    status: 'Active',
    totalSpent: 450.00
  }
];

export const INITIAL_SUBSCRIPTIONS = [
  {
    id: 'SUB-1001',
    customerId: 'CUST-001',
    customerName: 'David Miller',
    customerCompany: 'Acme Corporation',
    customerEmail: 'customer@acme.com',
    planId: 'PLAN-002',
    planName: 'Professional Growth',
    amount: 149,
    billingCycle: 'Monthly',
    startDate: '2026-10-01',
    expiryDate: '2026-11-01',
    nextBillingDate: '2026-11-01',
    status: 'Active',
    autoRenew: true,
    createdDate: '2026-10-01'
  },
  {
    id: 'SUB-1002',
    customerId: 'CUST-002',
    customerName: 'Elena Rostova',
    customerCompany: 'NovaWave Labs',
    customerEmail: 'elena@novawave.io',
    planId: 'PLAN-003',
    planName: 'Enterprise Scale',
    amount: 4990,
    billingCycle: 'Yearly',
    startDate: '2026-06-15',
    expiryDate: '2027-06-15',
    nextBillingDate: '2027-06-15',
    status: 'Active',
    autoRenew: true,
    createdDate: '2026-06-15'
  },
  {
    id: 'SUB-1003',
    customerId: 'CUST-003',
    customerName: 'Marcus Vance',
    customerCompany: 'Apex Logistics',
    customerEmail: 'marcus@apexlog.com',
    planId: 'PLAN-001',
    planName: 'Starter Cloud',
    amount: 49,
    billingCycle: 'Monthly',
    startDate: '2026-09-10',
    expiryDate: '2026-10-10',
    nextBillingDate: '2026-10-10',
    status: 'Overdue',
    autoRenew: true,
    createdDate: '2026-09-10'
  },
  {
    id: 'SUB-1004',
    customerId: 'CUST-004',
    customerName: 'Dr. Aisha Khan',
    customerCompany: 'Lumina Health Systems',
    customerEmail: 'aisha@lumina.org',
    planId: 'PLAN-002',
    planName: 'Professional Growth',
    amount: 149,
    billingCycle: 'Monthly',
    startDate: '2026-10-15',
    expiryDate: '2026-11-15',
    nextBillingDate: '2026-11-15',
    status: 'Active',
    autoRenew: true,
    createdDate: '2026-10-15'
  },
  {
    id: 'SUB-1005',
    customerId: 'CUST-005',
    customerName: 'Liam O\'Connor',
    customerCompany: 'Quantum Retail Group',
    customerEmail: 'liam@quantumretail.com',
    planId: 'PLAN-001',
    planName: 'Starter Cloud',
    amount: 15,
    billingCycle: 'Weekly',
    startDate: '2026-10-01',
    expiryDate: '2026-10-22',
    nextBillingDate: '2026-10-22',
    status: 'Paused',
    autoRenew: false,
    createdDate: '2026-10-01'
  }
];

export const INITIAL_INVOICES = [
  {
    id: 'INV-2026-001',
    subscriptionId: 'SUB-1001',
    customerId: 'CUST-001',
    customerName: 'David Miller',
    customerCompany: 'Acme Corporation',
    customerEmail: 'customer@acme.com',
    customerAddress: '100 Silicon Blvd, Suite 400, San Francisco, CA',
    items: [
      {
        description: 'Professional Growth Plan (Monthly Subscription)',
        quantity: 1,
        unitPrice: 149.00,
        amount: 149.00
      }
    ],
    subtotal: 149.00,
    taxRate: 10,
    taxAmount: 14.90,
    discountAmount: 0.00,
    totalAmount: 163.90,
    paidAmount: 163.90,
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    status: 'Paid', // 'Paid', 'Unpaid', 'Overdue'
    paymentMethod: 'Credit Card',
    notes: 'Thank you for your continued partnership with Brightloop.'
  },
  {
    id: 'INV-2026-002',
    subscriptionId: 'SUB-1002',
    customerId: 'CUST-002',
    customerName: 'Elena Rostova',
    customerCompany: 'NovaWave Labs',
    customerEmail: 'elena@novawave.io',
    customerAddress: '450 Tech Park Way, Austin, TX',
    items: [
      {
        description: 'Enterprise Scale Plan (Yearly Commitment)',
        quantity: 1,
        unitPrice: 4990.00,
        amount: 4990.00
      },
      {
        description: 'Priority Integration Onboarding Pack',
        quantity: 1,
        unitPrice: 499.00,
        amount: 499.00
      }
    ],
    subtotal: 5489.00,
    taxRate: 10,
    taxAmount: 548.90,
    discountAmount: 748.90,
    totalAmount: 5289.00,
    paidAmount: 5289.00,
    issueDate: '2026-06-15',
    dueDate: '2026-06-30',
    status: 'Paid',
    paymentMethod: 'Bank Wire Transfer',
    notes: 'Annual enterprise agreement terms applied.'
  },
  {
    id: 'INV-2026-003',
    subscriptionId: 'SUB-1003',
    customerId: 'CUST-003',
    customerName: 'Marcus Vance',
    customerCompany: 'Apex Logistics',
    customerEmail: 'marcus@apexlog.com',
    customerAddress: '78 Cargo Way, Terminal 4, Chicago, IL',
    items: [
      {
        description: 'Starter Cloud Plan (Monthly Subscription)',
        quantity: 1,
        unitPrice: 49.00,
        amount: 49.00
      }
    ],
    subtotal: 49.00,
    taxRate: 10,
    taxAmount: 4.90,
    discountAmount: 0.00,
    totalAmount: 53.90,
    paidAmount: 0.00,
    issueDate: '2026-09-10',
    dueDate: '2026-09-24',
    status: 'Overdue',
    paymentMethod: 'Pending',
    notes: 'Urgent: Payment overdue by 37 days. Service temporarily throttled.'
  },
  {
    id: 'INV-2026-004',
    subscriptionId: 'SUB-1001',
    customerId: 'CUST-001',
    customerName: 'David Miller',
    customerCompany: 'Acme Corporation',
    customerEmail: 'customer@acme.com',
    customerAddress: '100 Silicon Blvd, Suite 400, San Francisco, CA',
    items: [
      {
        description: 'Professional Growth Plan - Renewal Cycle Nov 2026',
        quantity: 1,
        unitPrice: 149.00,
        amount: 149.00
      }
    ],
    subtotal: 149.00,
    taxRate: 10,
    taxAmount: 14.90,
    discountAmount: 0.00,
    totalAmount: 163.90,
    paidAmount: 0.00,
    issueDate: '2026-10-25',
    dueDate: '2026-11-05',
    status: 'Unpaid',
    paymentMethod: 'Pending',
    notes: 'Upcoming billing invoice. Auto-charge scheduled on due date.'
  },
  {
    id: 'INV-2026-005',
    customerId: 'CUST-004',
    subscriptionId: 'SUB-1004',
    customerName: 'Dr. Aisha Khan',
    customerCompany: 'Lumina Health Systems',
    customerEmail: 'aisha@lumina.org',
    customerAddress: '880 Medical Plaza, Boston, MA',
    items: [
      {
        description: 'Professional Growth Plan (Monthly)',
        quantity: 1,
        unitPrice: 149.00,
        amount: 149.00
      }
    ],
    subtotal: 149.00,
    taxRate: 10,
    taxAmount: 14.90,
    discountAmount: 0.00,
    totalAmount: 163.90,
    paidAmount: 163.90,
    issueDate: '2026-10-15',
    dueDate: '2026-10-29',
    status: 'Paid',
    paymentMethod: 'UPI / Digital Express',
    notes: 'Thank you for your prompt payment.'
  }
];

export const INITIAL_PAYMENTS = [
  {
    id: 'PAY-9001',
    invoiceId: 'INV-2026-001',
    customerId: 'CUST-001',
    customerName: 'David Miller (Acme Corp)',
    amount: 163.90,
    paymentMethod: 'Credit Card (Visa •••• 4242)',
    paymentDate: '2026-10-02',
    reference: 'TXN-CC-8821901',
    status: 'Completed',
    note: 'Automated card charge successful',
    isDemo: true
  },
  {
    id: 'PAY-9002',
    invoiceId: 'INV-2026-002',
    customerId: 'CUST-002',
    customerName: 'Elena Rostova (NovaWave Labs)',
    amount: 5289.00,
    paymentMethod: 'Bank Wire Transfer',
    paymentDate: '2026-06-16',
    reference: 'WIRE-NVW-992318',
    status: 'Completed',
    note: 'Wire verified by financial officer',
    isDemo: true
  },
  {
    id: 'PAY-9003',
    invoiceId: 'INV-2026-005',
    customerId: 'CUST-004',
    customerName: 'Dr. Aisha Khan (Lumina Health)',
    amount: 163.90,
    paymentMethod: 'UPI / Instant Pay',
    paymentDate: '2026-10-16',
    reference: 'UPI-LUM-771239',
    status: 'Completed',
    note: 'Confirmed via QR scan',
    isDemo: true
  }
];

export const INITIAL_QUOTATIONS = [
  {
    id: 'QUO-501',
    customerName: 'Jordan Lee',
    customerCompany: 'Nexus Technologies',
    customerEmail: 'jordan@nexus.tech',
    planName: 'Enterprise Scale (Custom 50-Seat Pack)',
    billingCycle: 'Yearly',
    estimatedAmount: 4500.00,
    status: 'Sent',
    validUntil: '2026-11-15',
    createdDate: '2026-10-28',
    notes: 'Discount 10% applied for multi-year interest.'
  },
  {
    id: 'QUO-502',
    customerName: 'Samantha Green',
    customerCompany: 'Zenith Media House',
    customerEmail: 'sam@zenithmedia.com',
    planName: 'Professional Growth Tier',
    billingCycle: 'Yearly',
    estimatedAmount: 1490.00,
    status: 'Accepted',
    validUntil: '2026-11-05',
    createdDate: '2026-10-25',
    notes: 'Customer agreed verbally. Ready to convert to subscription.'
  },
  {
    id: 'QUO-503',
    customerName: 'Raj Patel',
    customerCompany: 'Horizon FinTech',
    customerEmail: 'raj@horizonfin.io',
    planName: 'Enterprise Scale + Dedicated SLA',
    billingCycle: 'Yearly',
    estimatedAmount: 8200.00,
    status: 'Draft',
    validUntil: '2026-11-20',
    createdDate: '2026-10-30',
    notes: 'Drafting compliance and security add-on.'
  }
];

export const MONTHLY_REVENUE_DATA = [
  { month: 'May', revenue: 14200, recurring: 11000, newSubs: 12 },
  { month: 'Jun', revenue: 19800, recurring: 14200, newSubs: 19 },
  { month: 'Jul', revenue: 21500, recurring: 18400, newSubs: 24 },
  { month: 'Aug', revenue: 24900, recurring: 21000, newSubs: 27 },
  { month: 'Sep', revenue: 28400, recurring: 24200, newSubs: 31 },
  { month: 'Oct', revenue: 34850, recurring: 29500, newSubs: 38 }
];

export const PLAN_DISTRIBUTION_DATA = [
  { name: 'Starter Cloud', value: 28, color: '#0EA5E9' },
  { name: 'Professional Growth', value: 45, color: '#6366F1' },
  { name: 'Enterprise Scale', value: 14, color: '#1E1B4B' }
];
