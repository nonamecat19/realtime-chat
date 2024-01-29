import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

export enum RoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: RoleEnum.USER,
    enum: RoleEnum,
    type: 'enum',
  })
  role: RoleEnum;

  @Column({unique: true, length: 30})
  nickname: string;

  @Column({select: false})
  password: string;

  @Column()
  nicknameColorHEX: string;

  @Column({default: false})
  isBanned: boolean;

  @Column({default: false})
  isMuted: boolean;

  constructor(item: Partial<User>) {
    Object.assign(this, item);
  }
}
