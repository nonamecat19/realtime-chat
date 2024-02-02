import {TokenData} from '../../shared/types/jwt.types';

export class TokensResponseDto {
  token: string;
  refreshToken?: string;
  user: TokenData;
}
