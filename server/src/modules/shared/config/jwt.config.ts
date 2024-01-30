import {registerAs} from '@nestjs/config';

export default registerAs('jwt', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpire: parseInt(process.env.JWT_ACCESS_EXPIRE),
  jwtRefreshExpire: parseInt(process.env.JWT_REFRESH_EXPIRE),
}));
