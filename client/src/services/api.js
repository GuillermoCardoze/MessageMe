const API_URL = 'http://127.0.0.1:5000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle responses
const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    throw new Error(data?.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

// Auth endpoints
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },
};

// User endpoints
export const userAPI = {
  getAll: async (search = '') => {
    const response = await fetch(
      `${API_URL}/users${search ? `?search=${search}` : ''}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getOne: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Group endpoints
export const groupAPI = {
  getAll: async (search = '') => {
    const response = await fetch(
      `${API_URL}/groups${search ? `?search=${search}` : ''}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  create: async (data) => {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getOne: async (id) => {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  join: async (id) => {
    const response = await fetch(`${API_URL}/groups/${id}/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  leave: async (id) => {
    const response = await fetch(`${API_URL}/groups/${id}/members`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Message endpoints
export const messageAPI = {
  getAll: async (days) => {
    const response = await fetch(
      `${API_URL}/messages${days ? `?days=${days}` : ''}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  send: async (data) => {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getConversation: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/messages`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};