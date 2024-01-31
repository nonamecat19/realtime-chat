import {Module} from '@nestjs/common';
import {AuthModule} from './modules/auth/auth.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {UsersModule} from './modules/users/users.module';
import {AppConfig, DatabaseConfig, JwtConfig} from './modules/shared/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../db/entities/user.entity';
import {ChatModule} from './modules/chat/chat.module';
import {JwtModule} from '@nestjs/jwt';
import {ChatMessage} from '../db/entities/chatMessage.entity';
import {ScheduleModule} from '@nestjs/schedule';
import {RedisModule} from '@nestjs-modules/ioredis';
import RedisConfig from './modules/shared/config/redis.config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.getOrThrow<string>('redis.url'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [AppConfig, DatabaseConfig, JwtConfig, RedisConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, ChatMessage]),
    ChatModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.jwtSecret'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
