import {io, Socket} from 'socket.io-client';
import {CookieService} from '@/services/CookieService.ts';
import {ConfigService} from '@/services/ConfigService.ts';

export class SocketApi {
  static socket: null | Socket = null;

  static createConnection() {
    const token = new CookieService().getToken();
    console.log({token});

    if (!token) {
      return;
    }

    this.socket = io(ConfigService.apiUrl, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.socket.on('connect_error', e => {
      console.error(e);
    });

    this.socket.on('connect', () => {
      console.log('connect');
    });

    this.socket.on('disconnect', e => {
      console.log('disconnect');
      console.error(e);
    });
  }

  static closeConnection() {
    this.socket?.close();
  }
}
