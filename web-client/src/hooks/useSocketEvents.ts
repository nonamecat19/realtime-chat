import {useEffect} from 'react';
import {SocketApi} from '@/api/socket.ts';

export interface SocketEvent {
  name: string;
  handler: (data: any) => void;
}

export function useSocketEvents(events: SocketEvent[] = []) {
  useEffect(() => {
    for (const event of events) {
      SocketApi.socket?.on(event.name, event.handler);
    }

    return function () {
      for (const event of events) {
        SocketApi.socket?.off(event.name);
      }
    };
  }, [events]);
}
