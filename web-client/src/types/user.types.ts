export type Role = 'ADMIN' | 'USER';

export type User = {
  id: number;
  nickname: string;
  nicknameColorHEX: string;
  role: Role;
  isBanned: boolean;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MappedUser = User & {online: boolean};

export type LoginUserData = {
  id: number;
  role: Role;
  nickname: string;
  isMuted: boolean;
};

export type LoginResponse = {
  token: string;
  user: LoginUserData;
};
