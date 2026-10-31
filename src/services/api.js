/**
 * Brightloop API Client Adapter
 * 
 * NOTE FOR BACKEND TEAMMATE:
 * This module is configured as a ready-to-wire API service layer.
 * To connect to your backend REST API, simply replace the localStorage handlers
 * with standard axios/fetch requests to your backend endpoints (e.g. baseURL: 'http://localhost:8000/api').
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  // Auth endpoints
  async login(credentials) {
    console.info('[API Adapter] POST /auth/login', credentials);
    return { success: true };
  },

  // Plan endpoints
  async getPlans() {
    console.info('[API Adapter] GET /plans');
    return [];
  },
  async createPlan(plan) {
    console.info('[API Adapter] POST /plans', plan);
    return plan;
  },

  // Subscription endpoints
  async getSubscriptions() {
    console.info('[API Adapter] GET /subscriptions');
    return [];
  },
  async createSubscription(sub) {
    console.info('[API Adapter] POST /subscriptions', sub);
    return sub;
  },
  async cancelSubscription(id) {
    console.info(`[API Adapter] PATCH /subscriptions/${id}/cancel`);
    return { success: true };
  },

  // Invoice endpoints
  async getInvoices() {
    console.info('[API Adapter] GET /invoices');
    return [];
  },
  async generateInvoice(payload) {
    console.info('[API Adapter] POST /invoices/generate', payload);
    return payload;
  },

  // Payment endpoints
  async recordPayment(payment) {
    console.info('[API Adapter] POST /payments', payment);
    return payment;
  }
};
