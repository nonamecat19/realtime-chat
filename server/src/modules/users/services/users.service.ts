import {Injectable, Logger} from '@nestjs/common';
import {UpdateUserDto} from '../dto/update-user.dto';
import {InjectRepository} from '@nestjs/typeorm';
import {RoleEnum, User} from '../../../../db/entities/user.entity';
import {Repository} from 'typeorm';
import {getRandomHex} from '../../shared/utils/colors.utils';
import * as bcrypt from 'bcrypt';
import {ReservedOrUserListener} from 'socket.io/dist/typed-events';
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRedis()
    private readonly redis: Redis
  ) {}
  public async create(login: string, password: string) {
    const saltOrRounds = 10;
    const cryptPassword = await bcrypt.hash(password, saltOrRounds);
    const usersCount = await this.usersRepository.count();
    return this.usersRepository.save({
      nickname: login,
      nicknameColorHEX: getRandomHex(),
      password: cryptPassword,
      role: usersCount === 0 ? RoleEnum.ADMIN : RoleEnum.USER,
    });
  }

  public findOneById(userId: number) {
    return this.usersRepository.findOne({where: {id: userId}});
  }

  public findAll() {
    return this.usersRepository.find();
  }

  async handleConnection(client: ReservedOrUserListener<any, any, any>) {
    try {
      this.logger.log(`Connected: ${client.id}`);
    } catch (e) {
      this.logger.error(`handleConnection: ${e.message}`);
    }
  }

  async handleDisconnect(client: ReservedOrUserListener<any, any, any>) {
    try {
      await this.redis.del(client.id);
      this.logger.log(`Disconnected: ${client.id}`);
    } catch (e) {
      this.logger.error(`handleDisconnect: ${e.message}`);
    }
  }
}
