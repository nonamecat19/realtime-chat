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
