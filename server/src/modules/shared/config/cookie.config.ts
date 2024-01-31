import {registerAs} from '@nestjs/config';

export default registerAs('cookie', () => ({
  refreshToken: 'refreshToken',
}));
