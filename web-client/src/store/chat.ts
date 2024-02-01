import {atom} from 'jotai';
import {ChatMessage, MappedChatMessage} from '@/types/chat.types.ts';

export const onlineAtom = atom<number[]>([]);

export const messagesAtom = atom<ChatMessage[]>([]);

export const mappedMessagesAtom = atom<MappedChatMessage[]>(get =>
  get(messagesAtom).map(message => ({
    ...message,
    user: {
      ...message.user,
      online: get(onlineAtom).includes(message.user.id),
    },
  }))
);
