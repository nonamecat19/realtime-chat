import {CanActivate, ExecutionContext, Injectable, Logger} from '@nestjs/common';
import {Observable} from 'rxjs';
import {Socket} from 'socket.io';
import {verify} from 'jsonwebtoken';
import {JwtData} from '../types/jwt.types';
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {getAllRedisData} from '../utils/redis.utils';

@Injectable()
export class WsJwtGuard implements CanActivate {
  logger = new Logger(WsJwtGuard.name);
  constructor(
    @InjectRedis()
    private readonly redis: Redis
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    const {authorization} = client.handshake.headers;

    const token: string = authorization.split(' ')[1];
    const dataFromToken = verify(token, 'secret') as JwtData;
    client.data.user = dataFromToken;
    const cacheData = {
      ...dataFromToken,
      timestamp: new Date(),
    };

    this.handleRedis(dataFromToken, client, cacheData).then();
    return true;
  }

  async handleRedis(dataFromToken: JwtData, client: Socket, cacheData: Record<any, any>) {
    const allData = await getAllRedisData(this.redis, 'user-*');
    this.logger.debug('getAllRedisData', allData);

    for (const [key, value] of Object.entries(allData)) {
      try {
        const deserialized = JSON.parse(value) as JwtData;
        console.log({key, deserialized});
        if (dataFromToken.user.id === deserialized.user.id) {
          //TODO: implement close socket
        }
      } catch (e) {
        this.logger.error(e);
      }
    }

    try {
      this.redis.set(`user-${client.id}`, JSON.stringify(cacheData));
      this.logger.debug('Cache data:', cacheData);
    } catch (e) {
      this.logger.error(`Cache set error ${e.message()}`);
    }
  }
}
