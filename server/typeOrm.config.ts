import {DataSource} from 'typeorm';
import {config} from 'dotenv';
import {ConfigService} from '@nestjs/config';
import {User} from './db/entities/user.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.getOrThrow('MYSQL_HOST'),
  port: configService.getOrThrow('MYSQL_PORT'),
  database: configService.getOrThrow('MYSQL_DATABASE'),
  username: configService.getOrThrow('MYSQL_USERNAME'),
  password: configService.getOrThrow('MYSQL_ROOT_PASSWORD'),
  migrations: ['src/modules/database/migrations/**'],
  entities: [User],
});
