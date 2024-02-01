import {
  SubscribeMessage,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets';
import {UsersService} from '../services/users.service';
import {UseFilters, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {BaseWebSocketGateway} from '../../shared/decorators/base-ws-gateway.decorator';
import {ReservedOrUserListener} from 'socket.io/dist/typed-events';
import {UsersServer} from '../types/usersEvents.types';
import {WsJwtGuard} from '../../shared/guards/ws-jwt.guard';
import {WsExceptionFilter} from '../../shared/filters/ws-validation.filter';
import {Socket} from 'socket.io';

@BaseWebSocketGateway()
@UseGuards(WsJwtGuard)
@UsePipes(ValidationPipe)
@UseFilters(WsExceptionFilter)
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  server: UsersServer;

  async handleConnection(client: ReservedOrUserListener<any, any, any>) {
    await this.usersService.handleConnection(client);
  }

  async handleDisconnect(client: ReservedOrUserListener<any, any, any>) {
    await this.usersService.handleDisconnect(client);
  }

  @SubscribeMessage('findAllOnlineUsers')
  findAll(@ConnectedSocket() client: Socket) {
    return this.usersService.findAllOnline(client);
  }
}
