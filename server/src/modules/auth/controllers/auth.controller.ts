import {Body, Controller, ForbiddenException, HttpCode, Post, Res, UseGuards} from '@nestjs/common';
import {UsersService} from '../../users/services/users.service';
import {AuthService} from '../services/auth.service';
import {LoginDto} from '../dto/login.dto';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {FastifyReply} from 'fastify';
import {CsrfGuard} from '../../shared/guards/csrf.guard';

@Controller('auth')
export class AuthController {
  REFRESH_TOKEN: string;
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    this.REFRESH_TOKEN = this.configService.get<string>('cookie.refreshToken');
  }

  @UseGuards(CsrfGuard)
  @HttpCode(200)
  @Post('/login')
  public async login(@Body() loginDto: LoginDto, @Res() response: FastifyReply) {
    let user = await this.authService.getUserByCredentials(loginDto);
    if (!user) {
      user = await this.usersService.create(loginDto.login, loginDto.password);
    }
    if (user.isBanned) {
      throw new ForbiddenException(['You banned']);
    }
    const {tokensDto} = await this.authService.getTokensByUser(user);
    response.send(tokensDto);
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
