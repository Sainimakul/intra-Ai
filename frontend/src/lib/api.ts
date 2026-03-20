import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('intra_token') || (typeof window !== 'undefined' ? localStorage.getItem('intra_token') : null);
  console.log(token)
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.startsWith('/auth')) {
        Cookies.remove('intra_token');
        localStorage.removeItem('intra_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
