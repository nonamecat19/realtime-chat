import {RoleEnum} from '../../../../db/entities/user.entity';

export class TokensResponseDto {
  token: string;
  refreshToken?: string;
  user: {
    id: number;
    role: keyof typeof RoleEnum;
    nickname: string;
    isMuted: boolean;
  };
}
