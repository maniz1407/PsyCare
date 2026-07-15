const API_URL = import.meta.env.VITE_API_URL || ''; // Proxy in dev, absolute URL in prod

const getHeaders = () => {
  const token = localStorage.getItem('psycare_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('psycare_token');
      localStorage.removeItem('psycare_user');
      // Redirect to login only if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const errorText = await response.text();
    throw new Error(errorText || 'Something went wrong');
  }
  if (response.status === 204) return null;
  
  // Try to parse as JSON, fallback to text if not JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

export const api = {
  auth: {
    login: async (username, password) => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      return handleResponse(res);
    },
    register: async (data) => {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  },
  dashboard: {
    getStats: async () => {
      const res = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
  clients: {
    getAll: async (search = '') => {
      const url = search ? `${API_URL}/api/clients?search=${encodeURIComponent(search)}` : `${API_URL}/api/clients`;
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_URL}/api/clients/${id}`, { headers: getHeaders() });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_URL}/api/clients/me`, { headers: getHeaders() });
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_URL}/api/clients/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_URL}/api/clients/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
  appointments: {
    getAll: async (start, end) => {
      let url = `${API_URL}/api/appointments`;
      if (start && end) {
        url += `?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
      }
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_URL}/api/appointments/${id}`, { headers: getHeaders() });
      return handleResponse(res);
    },
    getByClientId: async (clientId) => {
      const res = await fetch(`${API_URL}/api/appointments/client/${clientId}`, { headers: getHeaders() });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_URL}/api/appointments/me`, { headers: getHeaders() });
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
  notes: {
    getByClientId: async (clientId) => {
      const res = await fetch(`${API_URL}/api/notes/client/${clientId}`, { headers: getHeaders() });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_URL}/api/notes/${id}`, { headers: getHeaders() });
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_URL}/api/notes/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_URL}/api/notes/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
  invoices: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/api/invoices`, { headers: getHeaders() });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_URL}/api/invoices/${id}`, { headers: getHeaders() });
      return handleResponse(res);
    },
    getByClientId: async (clientId) => {
      const res = await fetch(`${API_URL}/api/invoices/client/${clientId}`, { headers: getHeaders() });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_URL}/api/invoices/me`, { headers: getHeaders() });
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_URL}/api/invoices`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    updateStatus: async (id, status) => {
      const res = await fetch(`${API_URL}/api/invoices/${id}/status?status=${encodeURIComponent(status)}`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    pay: async (id, transactionId) => {
      const res = await fetch(`${API_URL}/api/invoices/${id}/pay?transactionId=${encodeURIComponent(transactionId)}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
};

