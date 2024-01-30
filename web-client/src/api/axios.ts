import axios from 'axios';
import Cookies from 'js-cookie';

const request = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  withCredentials: true,
});

request.interceptors.request.use(
  config => {
    const accessToken = Cookies.get('accessToken') || null;
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

request.interceptors.response.use(
  response => {
    if (response.status === 401) {
      //TODO to router redirect
      window.location.href = '/login';
    }
    return response;
  },
  error => Promise.reject(error)
);

export {request};
