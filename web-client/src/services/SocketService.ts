import {io, Socket} from 'socket.io-client';
import {configService} from '@/services/ConfigService.ts';
import {notificationService} from '@/services/NotificationService.ts';
import {storageService} from '@/services/StorageService.ts';

class SocketService {
  socket: null | Socket = null;

  createConnection() {
    if (this.socket) {
      return;
    }

    const token = storageService.getToken();

    if (!token) {
      console.error('No token');
      return;
    }

    this.socket = io(configService.apiUrl, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.socket.on('connect_error', e => {
      notificationService.error('Connection error');
      console.error({connectError: e});
    });
  }

  closeConnection() {
    this.socket?.close();
    if (this.socket) {
      this.socket = null;
    }
  }

  reconnect() {
    this.closeConnection();
    this.createConnection();
  }
}
const socketService = new SocketService();
Object.freeze(socketService);
export {socketService};
