import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import RoleGuard from './components/common/RoleGuard';

import AdminDashboard from './pages/admin/AdminDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import CustomerPortal from './pages/customer/CustomerPortal';
import CustomerPlansPage from './pages/customer/CustomerPlansPage';
import CustomerInvoicesPage from './pages/customer/CustomerInvoicesPage';
import CustomerPaymentsPage from './pages/customer/CustomerPaymentsPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

import SubscriptionsPage from './pages/shared/SubscriptionsPage';
import InvoicesPage from './pages/shared/InvoicesPage';
import PaymentsPage from './pages/shared/PaymentsPage';
import PlansPage from './pages/shared/PlansPage';
import CustomersPage from './pages/staff/CustomersPage';
import QuotationsPage from './pages/staff/QuotationsPage';
import NotFound from './pages/NotFound';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'staff') return <Navigate to="/staff" replace />;
  if (user.role === 'customer') return <Navigate to="/customer" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Authenticated Dashboard Shell */}
            <Route element={<DashboardLayout />}>
              
              {/* ADMIN ROUTES */}
              <Route element={<RoleGuard allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/plans" element={<PlansPage />} />
              </Route>

              {/* STAFF & ADMIN SHARED ROUTES */}
              <Route element={<RoleGuard allowedRoles={['admin', 'staff']} />}>
                <Route path="/staff" element={<StaffDashboard />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/quotations" element={<QuotationsPage />} />
              </Route>

              {/* GENERAL SHARED MODULES (All roles have filtered view) */}
              <Route element={<RoleGuard allowedRoles={['admin', 'staff', 'customer']} />}>
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
              </Route>

              {/* CUSTOMER PORTAL SPECIFIC ROUTES */}
              <Route element={<RoleGuard allowedRoles={['customer', 'admin', 'staff']} />}>
                <Route path="/customer" element={<CustomerPortal />} />
                <Route path="/customer/plans" element={<CustomerPlansPage />} />
                <Route path="/customer/invoices" element={<CustomerInvoicesPage />} />
                <Route path="/customer/payments" element={<CustomerPaymentsPage />} />
                <Route path="/customer/profile" element={<CustomerProfilePage />} />
              </Route>

            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
