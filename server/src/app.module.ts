import {Module} from '@nestjs/common';
import {AuthModule} from './modules/auth/auth.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {UsersModule} from './modules/users/users.module';
import {AppConfig, DatabaseConfig, JwtConfig} from './config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../db/entities/user.entity';
import {ChatModule} from './modules/chat/chat.module';
import {JwtModule} from '@nestjs/jwt';
import {ChatMessage} from '../db/entities/chatMessage.entity';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [AppConfig, DatabaseConfig, JwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
