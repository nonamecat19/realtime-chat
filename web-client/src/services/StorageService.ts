import {configService} from '@/services/ConfigService.ts';

class StorageService {
  public setToken(token: string): void {
    localStorage.setItem(configService.apiUrl, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(configService.apiUrl) || null;
  }

  public deleteToken(): void {
    try {
      localStorage.removeItem(configService.apiUrl);
    } catch (e) {
      console.log({tokenRemoveError: e});
    }
  }
}
const storageService = new StorageService();
Object.freeze(storageService);
export {storageService};
