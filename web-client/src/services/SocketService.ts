import {io, Socket} from 'socket.io-client';
import {CookieService} from '@/services/CookieService.ts';
import {ConfigService} from '@/services/ConfigService.ts';
import {NotificationService} from '@/services/NotificationService.ts';

export class SocketService {
  static socket: null | Socket = null;

  static createConnection() {
    if (this.socket) {
      return;
    }

    const token = new CookieService().getToken();

    if (!token) {
      console.error('No token');
      return;
    }

    this.socket = io(ConfigService.apiUrl, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.socket.on('connect_error', e => {
      NotificationService.error('Connection error');
      console.error({connectError: e});
    });
  }

  static closeConnection() {
    this.socket?.close();
    if (this.socket) {
      this.socket = null;
    }
  }

  static reconnect() {
    this.closeConnection();
    this.createConnection();
  }
}
