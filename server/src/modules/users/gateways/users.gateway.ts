import {
  SubscribeMessage,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets';
import {UsersService} from '../services/users.service';
import {Logger, UseFilters, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {BaseWebSocketGateway} from '../../shared/decorators/base-ws-gateway.decorator';
import {ReservedOrUserListener} from 'socket.io/dist/typed-events';
import {UsersServer} from '../types/usersEvents.types';
import {WsJwtGuard} from '../../shared/guards/ws-jwt.guard';
import {WsExceptionFilter} from '../../shared/filters/ws-validation.filter';
import {Socket} from 'socket.io';
import {ErrorMessages} from '../../shared/enums/error.enum';

@BaseWebSocketGateway()
@UseGuards(WsJwtGuard)
@UsePipes(ValidationPipe)
@UseFilters(WsExceptionFilter)
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(UsersGateway.name);
  constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  server: UsersServer;

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization;
    const userOrError = await this.usersService.handleConnection(token, client.id);
    if (typeof userOrError === 'number') {
      client.emit('error', {status: userOrError, message: ErrorMessages[userOrError]});
      client.disconnect(true);
      return;
    }
    setTimeout(() => {
      client.broadcast.emit('userLogin', userOrError);
      this.logger.log(`Connected: ${client.id}`);
    }, 500);
  }

  async handleDisconnect(client: Socket) {
    await this.usersService.handleDisconnect(client);
  }

  @SubscribeMessage('findAllOnlineUsers')
  findAll(@ConnectedSocket() client: Socket) {
    return this.usersService.findAllOnline(client);
  }
}
