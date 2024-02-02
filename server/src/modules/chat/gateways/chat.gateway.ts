import {SubscribeMessage, WebSocketServer, MessageBody, ConnectedSocket} from '@nestjs/websockets';
import {ChatService} from '../services/chat.service';
import {Socket} from 'socket.io';
import {ChatServer} from '../types/chatEvents.types';
import {Logger, UseFilters, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {WsJwtGuard} from '../../shared/guards/ws-jwt.guard';
import {SocketAuthMiddleware} from '../../shared/middlewares/ws.middleware';
import {getConnectedClientsFromServer, getUserFromClient} from '../../shared/utils/socket.utils';
import {SendMessageDto} from '../dto/send-message.dto';
import {WsExceptionFilter} from '../../shared/filters/ws-validation.filter';
import {BaseWebSocketGateway} from '../../shared/decorators/base-ws-gateway.decorator';
import {Cron, CronExpression} from '@nestjs/schedule';
import {ErrorMessages, ErrorStatuses} from '../../shared/enums/error.enum';

@BaseWebSocketGateway()
@UseGuards(WsJwtGuard)
@UsePipes(ValidationPipe)
@UseFilters(WsExceptionFilter)
export class ChatGateway {
  logger = new Logger(ChatGateway.name);
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
    const trimmed = sendMessageDto.message.trim();
    if (trimmed.length < 1) {
      return client.emit('error', {status: 400, message: 'Message must not be empty'});
    }
    const messageOrError = await this.chatService.sendMessage(user.id, trimmed, client.id);
    if (typeof messageOrError === 'number') {
      const message = ErrorMessages[ErrorStatuses[messageOrError]];
      return client.emit('error', {status: messageOrError, message});
    }
    this.server.emit('receiveMessage', messageOrError);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    const connectedClients = getConnectedClientsFromServer(this.server);
    const usersId = await this.chatService.getOlineUsersId(connectedClients);
    this.server.emit('online', usersId);
    this.logger.log('Users notified');
  }

  @SubscribeMessage('getOlineUsersId')
  async getOlineUsersId() {
    const connectedClients = getConnectedClientsFromServer(this.server);
    return this.chatService.getOlineUsersId(connectedClients);
  }
}
