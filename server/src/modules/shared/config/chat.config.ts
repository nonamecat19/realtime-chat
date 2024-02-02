import {registerAs} from '@nestjs/config';

export default registerAs('chat', () => ({
  minimumTimeBetweenMessages: 15 * 1_000,
}));
