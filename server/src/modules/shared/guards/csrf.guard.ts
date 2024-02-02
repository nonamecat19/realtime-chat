import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    @InjectRedis()
    private readonly redis: Redis
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const csrfToken = context?.switchToHttp()?.getRequest()?.headers['x-csrf-token'];
    if (!csrfToken) {
      return false;
    }
    const redisKey = `csrf-${csrfToken}`;
    const tokenFromRedis = await this.redis.get(redisKey);
    if (!tokenFromRedis) {
      return false;
    }
    this.redis.del(redisKey);
    return true;
  }
}
