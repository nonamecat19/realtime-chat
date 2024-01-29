import {RoleEnum} from '../../../../db/entities/user.entity';

export type JwtData = {
  id: number;
  role: keyof typeof RoleEnum;
  nickname: string;
};
