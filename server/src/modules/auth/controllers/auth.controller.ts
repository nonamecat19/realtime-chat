import {Body, Controller, HttpCode, Post, Req, Res} from '@nestjs/common';
import {UsersService} from '../../users/services/users.service';
import {AuthService} from '../services/auth.service';
import {LoginDto} from '../dto/login.dto';
import {TokensResponseDto} from '../dto/tokens.response.dto';
import {Request, Response} from 'express';
import {JwtService} from '@nestjs/jwt';

const REFRESH_TOKEN_KEY = 'refreshToken';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @HttpCode(200)
  @Post('/login')
  public async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    let user = await this.authService.getUserByCredentials(loginDto);
    if (!user) {
      user = await this.usersService.create(loginDto.login, loginDto.password);
    }
    const data = {
      id: user.id,
      role: user.role,
      nickname: user.nickname,
    };

    const tokensDto = new TokensResponseDto();
    tokensDto.token = await this.authService.generateAccessJwtToken(data);
    const refreshToken = await this.authService.generateRefreshJwtToken(data);

    res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    return res.send(tokensDto);
  }

  @Post('/refresh')
  async refresh(@Res() res: Response, @Req() req: Request) {
    const oldRefreshToken = req.cookies[REFRESH_TOKEN_KEY];

    const result = this.jwtService.verify(oldRefreshToken);
    console.log({oldRefreshResult: result});

    const data = {
      id: result.id,
      role: result.role,
      nickname: result.nickname,
    };

    const tokensDto = new TokensResponseDto();
    tokensDto.token = await this.authService.generateAccessJwtToken(data);
    const refreshToken = await this.authService.generateRefreshJwtToken(data);

    res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.send(tokensDto);
  }
}
