import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from '../../../../db/entities/user.entity';
import {Repository} from 'typeorm';
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {SetStatusDto} from '../dto/set-status.dto';
import {Socket} from 'socket.io';
import {getCurrentConnectionsFromClient} from '../../shared/utils/socket.utils';
import {JwtData} from '../../shared/types/jwt.types';

@Injectable()
export class AdminService {
  logger = new Logger(AdminService.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRedis()
    private readonly redis: Redis
  ) {}

  public async setBanStatus(setStatusDto: SetStatusDto, client: Socket) {
    await this.usersRepository.update(
      {
        id: setStatusDto.userId,
      },
      {
        isBanned: setStatusDto.status,
      }
    );
    const socketArray = getCurrentConnectionsFromClient(client);
    for (const {name, value: socket} of socketArray) {
      const userInRedis = await this.redis.get(`user-${name}`);
      if (!userInRedis) {
        continue;
      }
      const deserialized: JwtData = JSON.parse(userInRedis);
      this.logger.debug({desId: deserialized.user.id, userId: setStatusDto.userId});
      if (deserialized.user.id === setStatusDto.userId) {
        socket.disconnect(true);
      }
    }
  }

  public async setMuteStatus(setStatusDto: SetStatusDto) {
    return this.usersRepository.update(
      {
        id: setStatusDto.userId,
      },
      {
        isMuted: setStatusDto.status,
      }
    );
  }

  public findAll() {
    return this.usersRepository.find();
  }
}
