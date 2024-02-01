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

@Injectable()
export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_ACCESS_EXPIRE: string;
  private readonly JWT_REFRESH_EXPIRE: string;
  private readonly logger: Logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {
    this.JWT_SECRET = configService.getOrThrow('jwt.jwtSecret');
    this.JWT_ACCESS_EXPIRE = configService.getOrThrow('jwt.jwtAccessExpire');
    this.JWT_REFRESH_EXPIRE = configService.getOrThrow('jwt.jwtRefreshExpire');
  }

  public async generateAccessJwtToken(user: any) {
    const payload = {user};
    return this.jwtService.sign(payload, {
      secret: this.JWT_SECRET,
      expiresIn: this.JWT_ACCESS_EXPIRE,
    });
  }

  public async generateRefreshJwtToken(user: any) {
    const payload = {user};
    return this.jwtService.sign(payload, {
      secret: this.JWT_SECRET,
      expiresIn: this.JWT_REFRESH_EXPIRE,
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

  public verifyBearerToken(token: string): JwtData {
    const noBearer = token.split(' ')[1];
    const data = verify(noBearer, this.JWT_SECRET);
    if (typeof data === 'string') {
      this.logger.error('Wrong format for token: ', data);
      throw new Error('Wrong format for token');
    }
    return data as JwtData;
  }
}
