import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {RoleEnum, User} from '../../../../db/entities/user.entity';
import {Repository} from 'typeorm';
import {getRandomHex} from '../../shared/utils/colors.utils';
import * as bcrypt from 'bcrypt';
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {JwtData, TokenData} from '../../shared/types/jwt.types';
import {AuthService} from '../../auth/services/auth.service';
import {ErrorStatuses} from '../../shared/enums/error.enum';
import {CurrentConnectionList} from '../../shared/types/socket.types';

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

  async handleUserConnection(token: string, clientId: string): Promise<User | ErrorStatuses> {
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

  async handleUserDisconnect(clientId: string): Promise<TokenData | ErrorStatuses> {
    try {
      const user = await this.redis.get(`user-${clientId}`);
      if (!user) {
        return ErrorStatuses.NOT_FOUND;
      }
      const deserializedUser: JwtData = JSON.parse(user);
      await this.redis.del(`user-${clientId}`);

      this.logger.log(`Disconnected: ${clientId}`);
      return deserializedUser.user;
    } catch (e) {
      this.logger.error(`handleDisconnect: ${e.message}`);
      return ErrorStatuses.SERVER_ERROR;
    }
  }

  async findAllOnline(allCurrentConnections: CurrentConnectionList) {
    const users = await this.usersRepository.find();
    const onlineId: number[] = [];

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
