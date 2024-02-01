import {useEffect} from 'react';
import {SocketService} from '@/services/SocketService.ts';

export function useConnectSocket() {
  useEffect(() => {
    SocketService.createConnection();
    return () => {
      SocketService.closeConnection();
    };
  }, []);
}
