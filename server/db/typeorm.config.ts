import {config} from 'dotenv';
import {ConfigService} from '@nestjs/config';
import {DataSource} from 'typeorm';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.getOrThrow<string>('MYSQL_HOST'),
  port: configService.getOrThrow<number>('MYSQL_PORT'),
  database: configService.getOrThrow<string>('MYSQL_DATABASE'),
  username: configService.getOrThrow<string>('MYSQL_USERNAME'),
  password: configService.getOrThrow<string>('MYSQL_ROOT_PASSWORD'),
  synchronize: configService.getOrThrow<string>('NODE_ENV') === 'development',
  entities: [`${__dirname}/entities/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  migrationsTableName: 'migrations',
});
