import {useEffect} from 'react';
import {socketService} from '@/services/SocketService.ts';

export function useConnectSocket() {
  useEffect(() => {
    socketService.createConnection();
    return () => {
      socketService.closeConnection();
    };
  }, []);
}
