import axios from 'axios';
import {CookieService} from '@/services/CookieService.ts';
import {ConfigService} from '@/services/ConfigService.ts';

const request = axios.create({
  baseURL: ConfigService.apiUrl,
  withCredentials: true,
});

request.interceptors.request.use(
  config => {
    const accessToken = new CookieService().getToken();
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
