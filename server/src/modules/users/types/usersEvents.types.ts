import {Server} from 'socket.io';
import {User} from '../../../../db/entities/user.entity';

export interface UsersEvents {
  updateUser: (payload: {userId: number; update: Partial<Record<keyof User, any>>}) => void;
}

export type UsersServer = Server<any, UsersEvents> | null;
