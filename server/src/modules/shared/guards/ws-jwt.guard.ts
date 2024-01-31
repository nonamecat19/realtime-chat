import {CanActivate, ExecutionContext, Injectable, Logger} from '@nestjs/common';
import {Observable} from 'rxjs';
import {Socket} from 'socket.io';
import {verify} from 'jsonwebtoken';
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

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
    this.redis
      .set(client.id, JSON.stringify(cacheData))
      .then(() => {
        this.logger.debug('Cache data:', cacheData);
      })
      .catch(e => {
        this.logger.error('Cache set error', e.message);
      });
    return true;
  }
}
