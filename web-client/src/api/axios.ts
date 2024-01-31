import axios, {AxiosError} from 'axios';
import {CookieService} from '@/services/CookieService.ts';
import {ConfigService} from '@/services/ConfigService.ts';
import {NotificationService} from '@/services/NotificationService.ts';

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
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      NotificationService.error('Wrong password');
    } else {
      NotificationService.error(error.message);
    }
    Promise.reject(error);
  }
);

export {request};
