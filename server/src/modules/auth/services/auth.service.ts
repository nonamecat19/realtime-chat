import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {LoginDto} from '../dto/login.dto';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from '../../../../db/entities/user.entity';
import {Repository} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  public async generateAccessJwtToken(user: any) {
    const payload = {user};
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('jwt.jwtSecret'),
      expiresIn: this.configService.getOrThrow('jwt.jwtAccessExpire'),
    });
  }

  public async generateRefreshJwtToken(user: any) {
    const payload = {user};
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('jwt.jwtSecret'),
      expiresIn: this.configService.getOrThrow('jwt.jwtRefreshExpire'),
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
}
