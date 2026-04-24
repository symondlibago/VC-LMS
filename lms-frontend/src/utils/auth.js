// auth.js
export const API_BASE_URL = 'http://localhost:8000/api';

export const getAuthToken = () => localStorage.getItem('auth_token');
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => !!getAuthToken();

export const logout = async () => {
  const token = getAuthToken();
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

export const authenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
    if (response.status === 401) logout();
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// API FOR EMPLOYEES
export const createEmployee = async (employeeData) => {
  return await authenticatedRequest('/employees', {
    method: 'POST',
    body: JSON.stringify(employeeData)
  });
};

export const updateEmployee = (id, data) => authenticatedRequest(`/employees/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});

export const deleteEmployee = (id) => authenticatedRequest(`/employees/${id}`, {
  method: 'DELETE'
});