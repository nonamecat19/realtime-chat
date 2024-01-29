import {Module} from '@nestjs/common';
import {AuthModule} from './modules/auth/auth.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {UsersModule} from './modules/users/users.module';
import {AppConfig, DatabaseConfig} from './config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../db/entities/user.entity';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [AppConfig, DatabaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
