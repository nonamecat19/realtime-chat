import axios, {AxiosError} from 'axios';
import {CookieService} from '@/services/CookieService.ts';
import {ConfigService} from '@/services/ConfigService.ts';
import {NotificationService} from '@/services/NotificationService.ts';
import {AxiosErrorWithMessages} from '@/types/request.types.ts';

export class RequestService {
  public readonly request = axios.create({
    baseURL: ConfigService.apiUrl,
    withCredentials: true,
  });
  constructor() {
    this.request.interceptors.request.use(
      config => {
        const accessToken = new CookieService().getToken();
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    this.request.interceptors.response.use(
      response => response,
      (error: AxiosError<AxiosErrorWithMessages>) => {
        if (error.response?.status === 401) {
          NotificationService.error('Wrong password');
        } else {
          const messages = error.response?.data?.message ?? [];

          if (!messages || messages.length === 0) {
            NotificationService.error(error.message);
          } else {
            for (const message of messages) {
              NotificationService.error(message);
            }
          }
        }

        Promise.reject(error).then();
      }
    );
  }
}
