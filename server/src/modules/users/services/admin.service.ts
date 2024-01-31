import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from '../../../../db/entities/user.entity';
import {Repository} from 'typeorm';
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {SetStatusDto} from '../dto/set-status.dto';

@Injectable()
export class AdminService {
  logger = new Logger(AdminService.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRedis()
    private readonly redis: Redis
  ) {}

  public async setBanStatus(setStatusDto: SetStatusDto) {
    return this.usersRepository.update(
      {
        id: setStatusDto.userId,
      },
      {
        isBanned: setStatusDto.status,
      }
    );
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
}
