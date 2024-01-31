import {Injectable} from '@nestjs/common';
import {UpdateUserDto} from '../dto/update-user.dto';
import {InjectRepository} from '@nestjs/typeorm';
import {RoleEnum, User} from '../../../../db/entities/user.entity';
import {Repository} from 'typeorm';
import {getRandomHex} from '../../shared/utils/colors.utils';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}
  public async create(login: string, password: string) {
    const saltOrRounds = 10;
    const cryptPassword = await bcrypt.hash(password, saltOrRounds);
    const usersCount = await this.usersRepository.count();
    return this.usersRepository.save({
      nickname: login,
      nicknameColorHEX: getRandomHex(),
      password: cryptPassword,
      role: usersCount === 0 ? RoleEnum.ADMIN : RoleEnum.USER,
    });
  }

  public findOneById(userId: number) {
    return this.usersRepository.findOne({where: {id: userId}});
  }

  public findAll() {
    return `This action returns all users`;
  }

  public findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  public update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  public remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
