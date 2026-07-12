import axios from 'axios';

// Create pre-configured axios instance for backend calls
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (can be used to inject JWT token in the future)
apiClient.interceptors.request.use((config) => {
  // TODO: Add Authorization header dynamically when auth logic is added
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
