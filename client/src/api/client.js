// API Service Client for Insurance Express Backend

const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error || (data.validationErrors ? data.validationErrors.join(', ') : 'An unexpected error occurred');
    throw new Error(errorMessage);
  }

  return data;
}

export const api = {
  // Auth & Users
  signup: (userData) => request('/api/users', { method: 'POST', body: userData }),
  login: (credentials) => request('/api/users/login', { method: 'POST', body: credentials }),
  getUser: (userId) => request(`/api/users/${userId}`),
  getUserPolicies: (userId) => request(`/api/users/${userId}/policies`),
  getUserClaims: (userId) => request(`/api/users/${userId}/claims`),

  // Policies
  getPolicies: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return request(`/api/policies${searchParams ? `?${searchParams}` : ''}`);
  },
  getPolicyById: (id) => request(`/api/policies/${id}`),
  createPolicy: (policyData) => request('/api/policies', { method: 'POST', body: policyData }),
  updatePolicy: (id, policyData) => request(`/api/policies/${id}`, { method: 'PUT', body: policyData }),
  deletePolicy: (id) => request(`/api/policies/${id}`, { method: 'DELETE' }),

  // Claims
  getClaims: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return request(`/api/claims${searchParams ? `?${searchParams}` : ''}`);
  },
  getClaimById: (id) => request(`/api/claims/${id}`),
  createClaim: (claimData) => request('/api/claims', { method: 'POST', body: claimData }),
  updateClaimStatus: (id, statusData) => request(`/api/claims/${id}/status`, { method: 'PATCH', body: statusData }),
  deleteClaim: (id) => request(`/api/claims/${id}`, { method: 'DELETE' }),

  // Reminders
  getReminders: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return request(`/api/reminders${searchParams ? `?${searchParams}` : ''}`);
  },
  createReminder: (reminderData) => request('/api/reminders', { method: 'POST', body: reminderData }),
  updateReminderStatus: (id, statusData) => request(`/api/reminders/${id}/status`, { method: 'PATCH', body: statusData }),
  deleteReminder: (id) => request(`/api/reminders/${id}`, { method: 'DELETE' }),
};

