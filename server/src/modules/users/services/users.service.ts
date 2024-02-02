import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {RoleEnum, User} from '../../../../db/entities/user.entity';
import {Repository} from 'typeorm';
import {getRandomHex} from '../../shared/utils/colors.utils';
import * as bcrypt from 'bcrypt';
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {Socket} from 'socket.io';
import {JwtData} from '../../shared/types/jwt.types';
import {AuthService} from '../../auth/services/auth.service';
import {getCurrentConnectionsFromClient} from '../../shared/utils/socket.utils';
import {ErrorStatuses} from '../../shared/enums/error.enum';

@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRedis()
    private readonly redis: Redis,
    private readonly authService: AuthService
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

  async handleConnection(token: string, clientId: string): Promise<User | ErrorStatuses> {
    try {
      const tokenDataOrError = await this.authService.verifyBearerToken(token);

      if (typeof tokenDataOrError === 'number') {
        return tokenDataOrError;
      }

      const user = await this.findOneById(tokenDataOrError.user.id);
      const cacheData = {
        ...tokenDataOrError,
        timestamp: new Date(),
      };
      this.redis.set(`user-${clientId}`, JSON.stringify(cacheData));
      return user;
    } catch (e) {
      return ErrorStatuses.SERVER_ERROR;
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const user = await this.redis.get(`user-${client.id}`);
      if (!user) {
        return;
      }
      const deserializedUser: JwtData = JSON.parse(user);
      await this.redis.del(`user-${client.id}`);
      client.broadcast.emit('userLogout', deserializedUser.user.id);
      this.logger.log(`Disconnected: ${client.id}`);
    } catch (e) {
      this.logger.error(`handleDisconnect: ${e.message}`);
    }
  }

  async findAllOnline(client: Socket) {
    const users = await this.usersRepository.find();
    const onlineId: number[] = [];
    const allCurrentConnections = getCurrentConnectionsFromClient(client);
    for (const connection of allCurrentConnections) {
      const redisData = await this.redis.get(`user-${connection.name}`);
      if (!redisData) {
        continue;
      }
      onlineId.push(JSON.parse(redisData).user.id);
    }
    return users.filter(user => onlineId.includes(user.id));
  }
}
