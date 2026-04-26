import axios from 'axios';

const baseURL =
  import.meta.env.REACT_APP_API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000';

const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vaxnepal_token');
  // Don't send token for login, register, or activate endpoints to avoid 401 if token is expired
  const isAuthRoute =
    config.url?.includes('/login/') ||
    config.url?.includes('/register/') ||
    config.url?.includes('/activate/');

  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
