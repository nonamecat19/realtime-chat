import {useEffect} from 'react';
import {SocketApi} from '@/api/socket.ts';

export function useConnectSocket() {
  useEffect(() => {
    SocketApi.createConnection();
    return () => {
      SocketApi.closeConnection();
    };
  }, []);
}
