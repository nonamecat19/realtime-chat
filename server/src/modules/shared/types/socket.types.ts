import {Socket} from 'socket.io';

type CurrentConnection = {name: string; value: Socket};

export type CurrentConnectionList = CurrentConnection[];
