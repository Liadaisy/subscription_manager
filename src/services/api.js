const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '');

const TOKEN_KEY = 'brightloop_access_token';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export const apiClient = {
  async login(credentials) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    localStorage.setItem(TOKEN_KEY, data.access_token);

    try {
      return await request('/users/me');
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      throw error;
    }
  },

  async getCurrentUser() {
    return request('/users/me');
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async getPlans() {
    return request('/plans');
  },

  async createPlan(plan) {
    return request('/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  },

  async getProducts() {
    return request('/products');
  },
};