import {Server} from 'socket.io';

export interface UsersEvents {}

export type UsersServer = Server<any, UsersEvents> | null;
