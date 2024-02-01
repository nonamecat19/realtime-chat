import {CanActivate, ExecutionContext, Injectable, Logger} from '@nestjs/common';
import {Socket} from 'socket.io';
import {JwtData} from '../types/jwt.types';
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {getAllRedisData} from '../utils/redis.utils';
import {AuthService} from '../../auth/services/auth.service';

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

      const dataFromToken = await this.authService.verifyBearerToken(authorization);
      client.data.user = dataFromToken;
      const cacheData = {
        ...dataFromToken,
        timestamp: new Date(),
      };
      await this.handleRedis(dataFromToken, client, cacheData);
    } catch (e) {
      client.emit('error', {status: 401, message: 'User is banned'});
      throw e;
    }

    return true;
  }

  async handleRedis(dataFromToken: JwtData, client: Socket, cacheData: Record<any, any>) {
    const allData = await getAllRedisData(this.redis, 'user-*');
    const socketsMap = client.nsp.sockets;
    const socketsArray = Array.from(socketsMap, ([name, value]) => ({name, value}));

    for (const [key, value] of Object.entries(allData)) {
      try {
        const deserialized = JSON.parse(value) as JwtData;
        if (dataFromToken.user.id === deserialized.user.id) {
          const socketId = key.replace('user-', '');
          for (const socket of socketsArray) {
            if (socket.name === socketId && socket.name !== client.id) {
              this.logger.debug({
                socketName: socket.name,
                socketId,
                clientId: client.id,
                userId: deserialized.user.id,
              });

              socket.value.disconnect(true);
              this.redis.del(`user-${socket.name}`);
            }
          }
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
