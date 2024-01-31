import {MessageBody, SubscribeMessage, WebSocketServer} from '@nestjs/websockets';
import {UseFilters, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {BaseWebSocketGateway} from '../../shared/decorators/base-ws-gateway.decorator';
import {UsersServer} from '../types/usersEvents.types';
import {WsJwtGuard} from '../../shared/guards/ws-jwt.guard';
import {WsExceptionFilter} from '../../shared/filters/ws-validation.filter';
import {AdminService} from '../services/admin.service';
import {SetStatusDto} from '../dto/set-status.dto';

@BaseWebSocketGateway()
//TODO: guard
@UseGuards(WsJwtGuard)
@UsePipes(ValidationPipe)
@UseFilters(WsExceptionFilter)
export class AdminGateway {
  constructor(private readonly adminService: AdminService) {}

  @WebSocketServer()
  server: UsersServer;

  @SubscribeMessage('setBanStatus')
  setBanStatus(@MessageBody() setStatusDto: SetStatusDto) {
    return this.adminService.setBanStatus(setStatusDto);
  }

  @SubscribeMessage('setMuteStatus')
  setMuteStatus(@MessageBody() setStatusDto: SetStatusDto) {
    return this.adminService.setMuteStatus(setStatusDto);
  }
}
