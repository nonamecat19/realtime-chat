import {SubscribeMessage, WebSocketServer, MessageBody, ConnectedSocket} from '@nestjs/websockets';
import {ChatService} from '../services/chat.service';
import {Socket} from 'socket.io';
import {ChatServer} from '../types/chatEvents.types';
import {Logger, UseFilters, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {WsJwtGuard} from '../../shared/guards/ws-jwt.guard';
import {SocketAuthMiddleware} from '../../shared/middlewares/ws.middleware';
import {getUserFromClient} from '../../shared/utils/socket.utils';
import {SendMessageDto} from '../dto/send-message.dto';
import {WsExceptionFilter} from '../../shared/filters/ws-validation.filter';
import {BaseWebSocketGateway} from '../../shared/decorators/base-ws-gateway.decorator';
import {Cron, CronExpression} from '@nestjs/schedule';

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
    await this.chatService.sendMessage(user.id, trimmed, client);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    const usersId = await this.chatService.getOlineUsersId(this.server);
    this.server.emit('online', usersId);
    this.logger.log('Users notified');
  }

  @SubscribeMessage('getOlineUsersId')
  async getOlineUsersId() {
    return this.chatService.getOlineUsersId(this.server);
  }
}
