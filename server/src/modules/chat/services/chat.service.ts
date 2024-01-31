import {Injectable, Logger, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ChatMessage} from '../../../../db/entities/chatMessage.entity';
import {Socket} from 'socket.io';
import {UsersService} from '../../users/services/users.service';
import {ChatServer} from '../types/chatEvents.types';
import Redis from 'ioredis';
import {InjectRedis} from '@nestjs-modules/ioredis';
import {JwtData} from '../../shared/types/jwt.types';

@Injectable()
export class ChatService {
  logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly usersService: UsersService,
    @InjectRedis()
    private readonly redis: Redis
  ) {}
  async getLastMessages() {
    return await this.chatMessageRepository.find({
      relations: {
        user: true,
      },
      take: 20,
    });
  }

  async sendMessage(userId: number, message: string, client: Socket) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      this.logger.error(`User not found. UserId: ${userId}`);
      throw new NotFoundException('User not found');
    }
    if (user.isMuted) {
      return client.emit('error', {status: 400, message: 'User is muted'});
    }
    if (user.isBanned) {
      return client.emit('error', {status: 400, message: 'User is banned'});
    }
    const newMessage = this.chatMessageRepository.create({
      message,
      user,
    });
    const result = await this.chatMessageRepository.save(newMessage);
    client.broadcast.emit('receiveMessage', result);
    client.emit('receiveMessage', result);
  }

  async broadcastOnlineStatus(server: ChatServer) {
    const connectedClients = [...server.sockets.sockets.keys()];
    const onlineUsersList = new Set();
    for (const client of connectedClients) {
      const user = await this.redis.get(client);
      if (!user) {
        continue;
      }
      const userData: JwtData = JSON.parse(user);
      onlineUsersList.add(userData.user.id);
    }
    server.emit('online', [...onlineUsersList]);
  }
}
