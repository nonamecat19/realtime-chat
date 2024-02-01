import {io, Socket} from 'socket.io-client';
import {CookieService} from '@/services/CookieService.ts';
import {ConfigService} from '@/services/ConfigService.ts';

export class SocketApi {
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
      console.log('connect_error');
      console.error({connectError: e});
    });

    this.socket.on('connect', () => {
      console.log('connect');
    });

    this.socket.on('disconnect', e => {
      console.log('disconnect');
      console.error({disconnectError: e});
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
