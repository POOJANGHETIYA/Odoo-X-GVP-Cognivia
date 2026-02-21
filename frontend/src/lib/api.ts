import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple response interceptor to strip the axios wrapper if the request is successful
// and standardized on { success: boolean, data: any }
api.interceptors.response.use((response) => {
  return response.data;
}, (error) => {
  return Promise.reject(error);
});
