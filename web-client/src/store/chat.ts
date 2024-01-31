import {atom} from 'jotai';
import {MappedUser, User} from '@/types/user.types.ts';
import {ChatMessage, MappedChatMessage} from '@/types/chat.types.ts';

export const onlineAtom = atom<number[]>([]);

export const usersAtom = atom<User[]>([]);

export const messagesAtom = atom<ChatMessage[]>([]);

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

export const mappedMessagesAtom = atom<MappedChatMessage[]>(get =>
  get(messagesAtom).map(message => ({
    ...message,
    user: {
      ...message.user,
      online: get(onlineAtom).includes(message.user.id),
    },
  }))
);
