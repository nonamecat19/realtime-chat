import {Server} from 'socket.io';
import {ChatMessage} from '../../../../db/entities/chatMessage.entity';

export interface ChatEvents {
  online: (usersId: number[]) => any;
  receiveMessage: (message: ChatMessage) => any;
}

export type ChatServer = Server<any, ChatEvents> | null;
