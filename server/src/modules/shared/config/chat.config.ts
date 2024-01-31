import {registerAs} from '@nestjs/config';

export default registerAs('chat', () => ({
  minimumTimeBetweenMessage: 15 * 1_000,
}));
