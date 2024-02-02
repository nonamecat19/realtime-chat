import {Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {LoginDto} from '../dto/login.dto';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from '../../../../db/entities/user.entity';
import {Repository} from 'typeorm';
import * as bcrypt from 'bcrypt';
import {TokensResponseDto} from '../dto/tokens.response.dto';
import {JwtData, TokenData} from '../../shared/types/jwt.types';
import {verify} from 'jsonwebtoken';
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtAccessExpire: string;
  private readonly jwtRefreshExpire: string;
  private readonly crlfTokenTtl: string;
  private readonly logger: Logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRedis()
    private readonly redis: Redis
  ) {
    this.jwtSecret = configService.getOrThrow('jwt.jwtSecret');
    this.jwtAccessExpire = configService.getOrThrow('jwt.jwtAccessExpire');
    this.jwtRefreshExpire = configService.getOrThrow('jwt.jwtRefreshExpire');
    this.crlfTokenTtl = configService.getOrThrow('redis.crlfTokenTtl');
  }

  public async generateAccessJwtToken(user: any) {
    const payload = {user};
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtAccessExpire,
    });
  }

  public async generateRefreshJwtToken(user: any) {
    const payload = {user};
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtRefreshExpire,
    });
  }

  public async getUserByCredentials(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: {
        nickname: loginDto.login,
      },
      select: {
        nickname: true,
        id: true,
        password: true,
        role: true,
        isMuted: true,
        isBanned: true,
      },
    });
    if (!user) {
      return null;
    }

    const result = await bcrypt.compare(loginDto.password, user.password);
    if (!result) {
      throw new UnauthorizedException();
    }

    return user;
  }

  public async getTokensByUser(
    user: TokenData
  ): Promise<{tokensDto: TokensResponseDto; refreshToken: string}> {
    const data = {
      id: user.id,
      role: user.role,
      nickname: user.nickname,
      isMuted: user.isMuted,
    };

    const tokensDto = new TokensResponseDto();
    tokensDto.token = await this.generateAccessJwtToken(data);
    tokensDto.user = data;
    const refreshToken = await this.generateRefreshJwtToken(data);
    return {tokensDto, refreshToken};
  }

  public async verifyBearerToken(token: string): Promise<JwtData> {
    const noBearer = token.split(' ')[1];
    const data = verify(noBearer, this.jwtSecret) as JwtData;
    if (typeof data === 'string') {
      this.logger.error('Wrong format for token: ', data);
      throw new UnauthorizedException('Wrong format for token');
    }
    const user = await this.usersRepository.findOne({where: {id: data.user.id}});
    if (!user) {
      this.logger.error('User not found');
      throw new UnauthorizedException('User not found');
    }
    if (user.isBanned) {
      this.logger.error('User is banned');
      throw new UnauthorizedException('User is banned');
    }
    return data;
  }

  public async setCsrfToken(token: string) {
    await this.redis.set(`csrf-${token}`, 'csrf', 'EX', this.crlfTokenTtl);
  }
}
