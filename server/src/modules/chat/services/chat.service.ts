import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ChatMessage} from '../../../../db/entities/chatMessage.entity';
import {UsersService} from '../../users/services/users.service';
import Redis from 'ioredis';
import {InjectRedis} from '@nestjs-modules/ioredis';
import {JwtData} from '../../shared/types/jwt.types';
import {ConfigService} from '@nestjs/config';
import {ErrorStatuses} from '../../shared/enums/error.enum';

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

  async sendMessage(
    userId: number,
    message: string,
    clientId: string
  ): Promise<ChatMessage | ErrorStatuses> {
    const lastMessageTime = await this.redis.get(`lastMessage-${clientId}`);
    if (lastMessageTime) {
      const lastMessageDate = new Date(lastMessageTime);
      const currentDate = new Date();
      const differenceInMs = currentDate.getTime() - lastMessageDate.getTime();
      if (differenceInMs < this.minimumTimeBetweenMessages) {
        return ErrorStatuses.TOO_MANY_REQUESTS;
      }
    }

    const user = await this.usersService.findOneById(userId);
    if (!user) {
      return ErrorStatuses.NOT_FOUND;
    }
    if (user.isMuted) {
      return ErrorStatuses.YOU_MUTED;
    }
    if (user.isBanned) {
      return ErrorStatuses.YOU_BANNED;
    }
    const newMessage = this.chatMessageRepository.create({
      message,
      user,
    });
    await this.redis.set(`lastMessage-${clientId}`, new Date().toString());
    return await this.chatMessageRepository.save(newMessage);
  }

  async getOlineUsersId(connectedClients: string[]): Promise<number[]> {
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
