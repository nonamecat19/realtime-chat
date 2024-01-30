import {User} from '@/types/user.types.ts';

export type ChatMessage = {
  id: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
};
