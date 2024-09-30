import axios from 'axios';

const axiosTokenInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add interceptors for request/response handling
axiosTokenInstance.interceptors.request.use(
    config => {
      // Add authorization token or other custom configurations here if needed
      const token = sessionStorage.getItem('authToken');
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
);
  
axiosTokenInstance.interceptors.response.use(
    response => response,
    error => {
      // Handle global errors here, like redirecting to login on 401
      if (error.response && error.response.status === 401) {
        // Redirect to login or handle token expiration
        console.log('Unauthorized, redirecting to login...');
        sessionStorage.removeItem('authToken');
        window.location.href = 'http://localhost:5173/login';
      }
      console.log("Error @ response - axiosTokenInstance : ", error);
      return Promise.reject(error);
    }
);

  
export default axiosTokenInstance;