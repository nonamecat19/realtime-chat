import {registerAs} from '@nestjs/config';
import * as process from 'process';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodenv: process.env.NODE_ENV,
  origin: process.env.ORIGIN,
}));
