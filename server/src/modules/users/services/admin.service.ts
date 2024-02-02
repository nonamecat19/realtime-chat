import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from '../../../../db/entities/user.entity';
import {Repository} from 'typeorm';
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {SetStatusDto} from '../dto/set-status.dto';
import {JwtData} from '../../shared/types/jwt.types';
import {CurrentConnectionList} from '../../shared/types/socket.types';

@Injectable()
export class AdminService {
  logger = new Logger(AdminService.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRedis()
    private readonly redis: Redis
  ) {}

  public async setBanStatus(
    setStatusDto: SetStatusDto,
    currentConnectionList: CurrentConnectionList
  ) {
    await this.usersRepository.update(
      {
        id: setStatusDto.userId,
      },
      {
        isBanned: setStatusDto.status,
      }
    );
    for (const {name, value: socket} of currentConnectionList) {
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
