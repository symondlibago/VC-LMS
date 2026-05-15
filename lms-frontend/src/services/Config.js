const API_BASE_URL = `http://${window.location.hostname}:8000/api`;

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  BOOKS: `${API_BASE_URL}/books`,
  CATEGORIES: `${API_BASE_URL}/categories`,
  BORROWINGS: `${API_BASE_URL}/borrowings`,
};

export default API_BASE_URL;