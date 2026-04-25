import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Extremely important for sending httpOnly cookies
});

// Interceptor for attaching auth tokens
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Skip refresh logic if the request is ALREADY to the refresh endpoint
    // 2. Skip if it's not a 401 error
    // 3. Skip if we've already retried this request
    if (
      originalRequest.url.includes('/auth/refresh') || 
      error.response?.status !== 401 || 
      originalRequest._retry
    ) {
      // If it was a refresh request that failed with 401, we must logout
      if (originalRequest.url.includes('/auth/refresh')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Attempt to refresh - use the same instance but it won't loop due to the check above
      const res = await apiClient.post('/auth/refresh', {}, { withCredentials: true });
      const newAccessToken = res.data.data.accessToken;
      
      // Update local storage
      localStorage.setItem('token', newAccessToken);
      
      // Update original request header and retry
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed (e.g., refresh token expired) -> force logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
