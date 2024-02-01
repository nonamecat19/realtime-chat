import {Socket} from 'socket.io';
import {UnauthorizedException} from '@nestjs/common';
import {RoleEnum} from '../../../../db/entities/user.entity';

interface IUser {
  id: number;
  role: keyof typeof RoleEnum;
  nickname: string;
}

export function getUserFromClient(client: Socket): IUser {
  const user = client.data.user.user;
  if (!user) {
    throw new UnauthorizedException();
  }
  return user;
}

export function getCurrentConnectionsFromClient(client: Socket): {name: string; value: Socket}[] {
  const socketsMap = client.nsp.sockets;
  return Array.from(socketsMap, ([name, value]) => ({name, value}));
}
