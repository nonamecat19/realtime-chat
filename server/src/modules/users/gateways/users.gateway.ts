import {
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import {UsersService} from '../services/users.service';
import {UpdateUserDto} from '../dto/update-user.dto';
import {Logger, UseFilters, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {BaseWebSocketGateway} from '../../shared/decorators/base-ws-gateway.decorator';
import {ReservedOrUserListener} from 'socket.io/dist/typed-events';
import {UsersServer} from '../types/usersEvents.types';
import {WsJwtGuard} from '../../shared/guards/ws-jwt.guard';
import {WsExceptionFilter} from '../../shared/filters/ws-validation.filter';
import Redis from 'ioredis';
import {InjectRedis} from '@nestjs-modules/ioredis';

@BaseWebSocketGateway()
@UseGuards(WsJwtGuard)
@UsePipes(ValidationPipe)
@UseFilters(WsExceptionFilter)
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  logger = new Logger(UsersGateway.name);

  constructor(
    private readonly usersService: UsersService,
    @InjectRedis()
    private readonly redis: Redis
  ) {}

  @WebSocketServer()
  server: UsersServer;

  async handleConnection(client: ReservedOrUserListener<any, any, any>) {
    try {
      this.logger.log(`Connected: ${client.id}`);
    } catch (e) {
      this.logger.error(`handleConnection: ${e.message}`);
    }
  }

  async handleDisconnect(client: ReservedOrUserListener<any, any, any>) {
    try {
      await this.redis.del(client.id);
      this.logger.log(`Disconnected: ${client.id}`);
    } catch (e) {
      this.logger.error(`handleDisconnect: ${e.message}`);
    }
  }

  @SubscribeMessage('findAllUsers')
  findAll() {
    return this.usersService.findAll();
  }

  @SubscribeMessage('findOneUser')
  findOne(@MessageBody() id: number) {
    return this.usersService.findOne(id);
  }

  @SubscribeMessage('updateUser')
  update(@MessageBody() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id, updateUserDto);
  }

  @SubscribeMessage('removeUser')
  remove(@MessageBody() id: number) {
    return this.usersService.remove(id);
  }
}
