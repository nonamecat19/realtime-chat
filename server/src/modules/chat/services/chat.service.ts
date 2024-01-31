import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ChatMessage} from '../../../../db/entities/chatMessage.entity';
import {Socket} from 'socket.io';
import {UsersService} from '../../users/services/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly usersService: UsersService
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
}
