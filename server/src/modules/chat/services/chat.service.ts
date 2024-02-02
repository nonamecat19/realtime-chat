import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ChatMessage} from '../../../../db/entities/chatMessage.entity';
import {Socket} from 'socket.io';
import {UsersService} from '../../users/services/users.service';
import {ChatServer} from '../types/chatEvents.types';
import Redis from 'ioredis';
import {InjectRedis} from '@nestjs-modules/ioredis';
import {JwtData} from '../../shared/types/jwt.types';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class ChatService {
  logger = new Logger(ChatService.name);
  private readonly minimumTimeBetweenMessages: number;
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly usersService: UsersService,
    @InjectRedis()
    private readonly redis: Redis,
    private readonly configService: ConfigService
  ) {
    this.minimumTimeBetweenMessages = configService.getOrThrow<number>(
      'chat.minimumTimeBetweenMessages'
    );
  }
  async getLastMessages() {
    return (
      await this.chatMessageRepository.find({
        relations: {
          user: true,
        },
        order: {
          id: 'DESC',
        },
        take: 20,
      })
    ).reverse();
  }

  async sendMessage(userId: number, message: string, client: Socket) {
    const lastMessageTime = await this.redis.get(`lastMessage-${client.id}`);
    if (lastMessageTime) {
      const lastMessageDate = new Date(lastMessageTime);
      const currentDate = new Date();
      const differenceInMs = currentDate.getTime() - lastMessageDate.getTime();
      if (differenceInMs < this.minimumTimeBetweenMessages) {
        return client.emit('error', {status: 429, message: 'Too many requests'});
      }
    }

    const user = await this.usersService.findOneById(userId);
    if (!user) {
      this.logger.error(`User not found. UserId: ${userId}`);
      return client.emit('error', {status: 401, message: 'Your account not found'});
    }
    if (user.isMuted) {
      return client.emit('error', {status: 400, message: 'You muted'});
    }
    if (user.isBanned) {
      return client.emit('error', {status: 401, message: 'You banned'});
    }
    const newMessage = this.chatMessageRepository.create({
      message,
      user,
    });
    const result = await this.chatMessageRepository.save(newMessage);
    client.broadcast.emit('receiveMessage', result);
    client.emit('receiveMessage', result);
    await this.redis.set(`lastMessage-${client.id}`, new Date().toString());
  }

  async getOlineUsersId(server: ChatServer): Promise<number[]> {
    const connectedClients = [...server.sockets.sockets.keys()];
    const onlineUsersList = new Set<number>();
    for (const client of connectedClients) {
      const user = await this.redis.get(`user-${client}`);
      if (!user) {
        continue;
      }
      const userData: JwtData = JSON.parse(user);
      onlineUsersList.add(userData.user.id);
    }
    return [...onlineUsersList];
  }
}
