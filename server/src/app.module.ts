import {Module} from '@nestjs/common';
import {AuthModule} from './modules/auth/auth.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {UsersModule} from './modules/users/users.module';
import {AppConfig, DatabaseConfig, JwtConfig} from './config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../db/entities/user.entity';
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
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([User, ChatMessage]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
