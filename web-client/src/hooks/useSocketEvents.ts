import {useEffect} from 'react';
import {socketService} from '@/services/SocketService.ts';

export interface SocketEvent {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (data: any) => void;
}

export function useSocketEvents(events: SocketEvent[] = []) {
  useEffect(() => {
    for (const event of events) {
      socketService.socket?.on(event.name, event.handler);
    }

    return function () {
      for (const event of events) {
        socketService.socket?.off(event.name);
      }
    };
  }, [events]);
}
