import {RoleEnum} from '../../../../db/entities/user.entity';

export type JwtData = {
  user: {
    id: number;
    role: keyof typeof RoleEnum;
    nickname: string;
  };
  iat: number;
  exp: number;
};

export type TokenData = {
  id: number;
  role: keyof typeof RoleEnum;
  nickname: string;
  isMuted: boolean;
};
