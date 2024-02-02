import {CanActivate, ExecutionContext, Injectable, Logger} from '@nestjs/common';
import {Socket} from 'socket.io';
import {JwtData} from '../types/jwt.types';
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {getAllRedisData} from '../utils/redis.utils';
import {AuthService} from '../../auth/services/auth.service';
import {getCurrentConnectionsFromClient} from '../utils/socket.utils';
import {ErrorMessages} from '../enums/error.enum';

@Injectable()
export class WsJwtGuard implements CanActivate {
  logger = new Logger(WsJwtGuard.name);
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    try {
      const {authorization} = client.handshake.headers;

      const dataFromTokenOrError = await this.authService.verifyBearerToken(authorization);
      if (typeof dataFromTokenOrError === 'number') {
        client.emit('error', {
          status: dataFromTokenOrError,
          message: ErrorMessages[dataFromTokenOrError],
        });
        return;
      }

      client.data.user = dataFromTokenOrError;
      const cacheData = {
        ...dataFromTokenOrError,
        timestamp: new Date(),
      };
      await this.handleRedis(dataFromTokenOrError, client, cacheData);
    } catch (e) {
      client.emit('error', {status: 400, message: e.message});
      throw e;
    }

    return true;
  }

  async handleRedis(dataFromToken: JwtData, client: Socket, cacheData: Record<any, any>) {
    const allData = await getAllRedisData(this.redis, 'user-*');
    const socketsArray = getCurrentConnectionsFromClient(client);

    for (const [key, value] of Object.entries(allData)) {
      try {
        const deserialized = JSON.parse(value) as JwtData;
        if (dataFromToken.user.id !== deserialized.user.id) {
          continue;
        }
        const socketId = key.replace('user-', '');
        for (const socket of socketsArray) {
          if (socket.name !== socketId || socket.name === client.id) {
            continue;
          }
          this.logger.debug({
            socketName: socket.name,
            socketId,
            clientId: client.id,
            userId: deserialized.user.id,
          });
          socket.value.disconnect(true);
          this.redis.del(`user-${socket.name}`);
        }
      } catch (e) {
        this.logger.error(e);
      }
    }

    try {
      this.redis.set(`user-${client.id}`, JSON.stringify(cacheData));
    } catch (e) {
      this.logger.error(`Cache set error ${e.message()}`);
    }
  }
}
