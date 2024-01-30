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
  async getMessages() {
    return await this.chatMessageRepository.find({
      relations: {
        user: true,
      },
    });
  }

  async sendMessage(userId: number, message: string, client: Socket) {
    console.log({userId, message});
    const user = await this.usersService.findOneById(userId);
    const newMessage = this.chatMessageRepository.create({
      message,
      user,
    });
    const result = await this.chatMessageRepository.save(newMessage);
    client.emit('receive-message', result);
    return 2;
  }
}
