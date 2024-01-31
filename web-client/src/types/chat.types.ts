import {MappedUser, User} from '@/types/user.types.ts';

export type MappedChatMessage = {
  id: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  user: MappedUser;
};

export type ChatMessage = {
  id: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
};
