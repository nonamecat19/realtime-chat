import CookieConfig from './cookie.config';
import AppConfig from './app.config';
import DatabaseConfig from './database.config';
import JwtConfig from './jwt.config';
import RedisConfig from './redis.config';

export const AppConfigs = [AppConfig, DatabaseConfig, JwtConfig, RedisConfig, CookieConfig];
