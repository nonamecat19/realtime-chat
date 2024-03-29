import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketServer} from '@nestjs/websockets';
import {UseFilters, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {BaseWebSocketGateway} from '../../shared/decorators/base-ws-gateway.decorator';
import {UsersServer} from '../types/usersEvents.types';
import {WsJwtGuard} from '../../shared/guards/ws-jwt.guard';
import {WsExceptionFilter} from '../../shared/filters/ws-validation.filter';
import {AdminService} from '../services/admin.service';
import {SetStatusDto} from '../dto/set-status.dto';
import {Socket} from 'socket.io';
import {AdminWsGuard} from '../../shared/guards/admin-ws.guard';
import {getCurrentConnectionsFromClient} from '../../shared/utils/socket.utils';

@BaseWebSocketGateway()
@UseGuards(WsJwtGuard, AdminWsGuard)
@UsePipes(ValidationPipe)
@UseFilters(WsExceptionFilter)
export class AdminGateway {
  constructor(private readonly adminService: AdminService) {}

  @WebSocketServer()
  server: UsersServer;

  @SubscribeMessage('setBanStatus')
  async setBanStatus(@MessageBody() setStatusDto: SetStatusDto, @ConnectedSocket() client: Socket) {
    const currentConnectionList = getCurrentConnectionsFromClient(client);
    await this.adminService.setBanStatus(setStatusDto, currentConnectionList);
    this.server.emit('updateUser', {
      userId: setStatusDto.userId,
      update: {
        isBanned: setStatusDto.status,
      },
    });
    client.emit('success');
  }

  @SubscribeMessage('setMuteStatus')
  async setMuteStatus(
    @MessageBody() setStatusDto: SetStatusDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.adminService.setMuteStatus(setStatusDto);
    this.server.emit('updateUser', {
      userId: setStatusDto.userId,
      update: {
        isMuted: setStatusDto.status,
      },
    });
    client.emit('success');
  }

  @SubscribeMessage('findAllUsers')
  findAll() {
    return this.adminService.findAll();
  }
}
