import {registerAs} from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_ROOT_PASSWORD,
  synchronize: process.env.NODE_ENV === 'development',
  entities: [`${__dirname}/../../db/entities/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/../../db/migrations/*{.ts,.js}`],
  migrationsTableName: 'migrations',
}));
