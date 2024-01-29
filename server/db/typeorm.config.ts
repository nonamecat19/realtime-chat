import {config} from 'dotenv';
import {ConfigService} from '@nestjs/config';
import {DataSource} from 'typeorm';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: configService.get('MYSQL_PORT'),
  database: configService.get('MYSQL_DATABASE'),
  username: configService.get('MYSQL_USERNAME'),
  password: configService.get('MYSQL_ROOT_PASSWORD'),
  synchronize: configService.get('NODE_ENV') === 'development',
  entities: [`${__dirname}/entities/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  migrationsTableName: 'migrations',
});
