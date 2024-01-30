import {useEffect} from 'react';
import {SocketApi} from '@/api/socket.ts';

export interface SocketEvent {
  name: string;
  handler(...args: any[]): any;
}

export function useSocketEvents(events: SocketEvent[]) {
  const socket = SocketApi.socket;
  useEffect(() => {
    for (const event of events) {
      socket?.on(event.name, event.handler);
    }

    return function () {
      for (const event of events) {
        socket?.off(event.name);
      }
    };
  }, [socket, events]);
}
