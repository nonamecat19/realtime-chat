import {WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer} from '@nestjs/websockets';
import {UsersService} from '../services/users.service';
import {UpdateUserDto} from '../dto/update-user.dto';
import {Server} from 'socket.io';
import {OnModuleInit} from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: '*',
  },
})
export class UsersGateway implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', socket => {
      console.log(socket.id);
      console.log('Connected');
    });
  }

  @SubscribeMessage('findAllUsers')
  findAll() {
    return this.usersService.findAll();
  }

  @SubscribeMessage('findOneUser')
  findOne(@MessageBody() id: number) {
    return this.usersService.findOne(id);
  }

  @SubscribeMessage('updateUser')
  update(@MessageBody() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id, updateUserDto);
  }

  @SubscribeMessage('removeUser')
  remove(@MessageBody() id: number) {
    return this.usersService.remove(id);
  }
}
