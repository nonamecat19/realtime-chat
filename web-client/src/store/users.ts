import {LoginUserData, MappedUser, User} from '@/types/user.types.ts';
import {atom} from 'jotai';
import {onlineAtom} from '@/store/chat.ts';

export const userDataAtom = atom<LoginUserData | null>(null);

export const usersAtom = atom<User[]>([]);

export const mappedUsersAtom = atom<MappedUser[]>(get =>
  get(usersAtom).map(user => {
    return {
      ...user,
      online: get(onlineAtom).includes(user.id),
    };
  })
);

export const mappedOnlineUsersAtom = atom<MappedUser[]>(get =>
  get(mappedUsersAtom).filter(user => user.online)
);

export const mappedOfflineUsersAtom = atom<MappedUser[]>(get =>
  get(mappedUsersAtom).filter(user => !user.online)
);
