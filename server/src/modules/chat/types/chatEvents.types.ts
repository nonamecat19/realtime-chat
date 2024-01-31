import {Server} from 'socket.io';

export interface ChatEvents {
  newMessage: (payload: any) => any;
  online: (payload: any) => any;
}

export type ChatServer = Server<any, ChatEvents> | null;
