import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {UsersService} from '../../users/services/users.service';
import {AuthService} from '../services/auth.service';
import {LoginDto} from '../dto/login.dto';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {FastifyReply} from 'fastify';
import {CsrfGuard} from '../../shared/guards/csrf.guard';
import {ErrorMessages, ErrorStatuses} from '../../shared/enums/error.enum';

@Controller('auth')
export class AuthController {
  refreshToken: string;
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    this.refreshToken = this.configService.get<string>('cookie.refreshToken');
  }

  @UseGuards(CsrfGuard)
  @HttpCode(200)
  @Post('/login')
  public async login(@Body() loginDto: LoginDto, @Res() reply: FastifyReply) {
    let userOrError = await this.authService.getUserOrErrorByCredentials(loginDto);
    if (typeof userOrError === 'number') {
      if (userOrError === ErrorStatuses.NOT_FOUND) {
        userOrError = await this.usersService.create(loginDto.login, loginDto.password);
      } else if (userOrError === ErrorStatuses.AUTH_ERROR) {
        throw new UnauthorizedException(ErrorMessages[ErrorStatuses.AUTH_ERROR]);
      } else {
        throw new BadRequestException(ErrorMessages[ErrorStatuses[userOrError]]);
      }
    } else {
      if (userOrError.isBanned) {
        throw new ForbiddenException(ErrorMessages[ErrorStatuses.YOU_BANNED]);
      }
    }

    const {tokensDto} = await this.authService.getTokensByUser(userOrError);
    reply.send(tokensDto);
  }

  // @Post('/refresh')
  // async refresh(@Res() res: Response, @Req() req: Request) {
  //   const oldRefreshToken = req.cookies[this.REFRESH_TOKEN];
  //   const user = this.jwtService.verify(oldRefreshToken);
  //
  //   const {tokensDto, refreshToken} = await this.authService.getTokensByUser(user);
  //   res.cookie(this.REFRESH_TOKEN, refreshToken, {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'strict',
  //   });
  //   return res.send(tokensDto);
  // }

  @Post('/generateCsrf')
  async generateCsrf(@Res() reply: FastifyReply) {
    const token = reply.generateCsrf();
    await this.authService.setCsrfToken(token);
    reply.send({token});
  }
}
