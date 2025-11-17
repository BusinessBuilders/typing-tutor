import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_TIMEOUTS } from '../../utils/constants';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  timeout: API_TIMEOUTS.DEFAULT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add timestamp to requests for debugging
    config.headers['X-Request-Time'] = new Date().toISOString();

    // You can add auth tokens here if needed
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx will trigger this function
    return response;
  },
  (error: AxiosError) => {
    // Any status codes outside the range of 2xx will trigger this function

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;

      switch (status) {
        case 400:
          console.error('Bad Request:', error.response.data);
          break;
        case 401:
          console.error('Unauthorized:', error.response.data);
          // Handle unauthorized access (e.g., redirect to login)
          break;
        case 403:
          console.error('Forbidden:', error.response.data);
          break;
        case 404:
          console.error('Not Found:', error.response.data);
          break;
        case 429:
          console.error('Too Many Requests - Rate Limited:', error.response.data);
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error('Server Error:', error.response.data);
          break;
        default:
          console.error('HTTP Error:', status, error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error - No response received:', error.message);
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function for retry logic with exponential backoff
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        // Calculate exponential backoff delay
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export default apiClient;
