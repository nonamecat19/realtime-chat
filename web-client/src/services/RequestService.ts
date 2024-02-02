import axios, {AxiosError} from 'axios';
import {AxiosErrorWithMessages} from '@/types/request.types.ts';
import {configService} from '@/services/ConfigService.ts';
import {storageService} from '@/services/StorageService.ts';
import {notificationService} from '@/services/NotificationService.ts';

class RequestService {
  public readonly request = axios.create({
    baseURL: configService.apiUrl,
    withCredentials: true,
  });
  constructor() {
    this.request.interceptors.request.use(
      async config => {
        const csrfTokenRequest = await axios.post(
          '/auth/generateCsrf',
          {},
          {
            baseURL: configService.apiUrl,
            withCredentials: true,
          }
        );
        const accessToken = storageService.getToken();
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        config.headers['x-csrf-token'] = csrfTokenRequest.data.token;
        return config;
      },
      error => Promise.reject(error)
    );

    this.request.interceptors.response.use(
      response => response,
      (error: AxiosError<AxiosErrorWithMessages>) => {
        if (error.response?.status === 401) {
          notificationService.error('Wrong password');
        } else {
          const messages = error.response?.data?.message ?? [];

          if (!messages || messages.length === 0) {
            notificationService.error(error.message);
          } else {
            for (const message of messages) {
              notificationService.error(message);
            }
          }
        }

        Promise.reject(error).then();
      }
    );
  }
}
const requestService = new RequestService();
Object.freeze(requestService);
export {requestService};
