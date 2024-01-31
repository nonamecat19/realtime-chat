import {SubscribeMessage, WebSocketServer, MessageBody, ConnectedSocket} from '@nestjs/websockets';
import {ChatService} from '../services/chat.service';
import {Server, Socket} from 'socket.io';
import {ChatEvents} from '../types/chatEvents.types';
import {UseFilters, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {Socket} from 'socket.io';
import {ChatServer} from '../types/chatEvents.types';
import {WsJwtGuard} from '../../shared/guards/ws-jwt.guard';
import {SocketAuthMiddleware} from '../../shared/middlewares/ws.middleware';
import {getUserFromClient} from '../../shared/utils/socket.utils';
import {SendMessageDto} from '../dto/send-message.dto';
import {WsExceptionFilter} from '../../shared/filters/ws-validation.filter';
import {BaseWebSocketGateway} from '../../shared/decorators/base-ws-gateway.decorator';

@BaseWebSocketGateway()
@UseGuards(WsJwtGuard)
@UsePipes(ValidationPipe)
@UseFilters(WsExceptionFilter)
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: ChatServer = null;

  afterInit(client: Socket) {
    //TODO type improvement
    client.use(SocketAuthMiddleware() as any);
  }

  @SubscribeMessage('getMessages')
  getMessages() {
    return this.chatService.getLastMessages();
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    const user = getUserFromClient(client);
    await this.chatService.sendMessage(user.id, sendMessageDto.message, client);
  }
}
