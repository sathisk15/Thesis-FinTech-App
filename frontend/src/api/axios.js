import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// S7: withCredentials ensures HttpOnly cookies are sent with every request
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
});

// S7: No Authorization header injection — token lives in an HttpOnly cookie,
// inaccessible to JS. The browser attaches the cookie automatically.

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // S6: On 401, attempt one silent token refresh before logging out
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        await api.post('/auth/refresh'); // uses refreshToken cookie automatically
        return api(error.config);        // retry original request with new access cookie
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
