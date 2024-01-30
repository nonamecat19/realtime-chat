import {Socket} from 'socket.io';
import {Logger, UnauthorizedException} from '@nestjs/common';
import {verify} from 'jsonwebtoken';
import {ConfigService} from '@nestjs/config';

export type SocketIOMiddleware = {
  (client: Socket, next: (err?: Error) => void);
};

const configService = new ConfigService();

export const SocketAuthMiddleware = (): SocketIOMiddleware => {
  const logger = new Logger(SocketAuthMiddleware.name);
  return (client, next) => {
    try {
      const {authorization} = client.handshake.headers;
      if (!authorization) {
        throw new UnauthorizedException('No token found');
      }
      const token: string = authorization.split(' ')[1];
      verify(token, configService.get('JWT_SECRET'));
      next();
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
};
