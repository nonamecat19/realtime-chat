import {useAtom, useAtomValue, useSetAtom} from 'jotai/index';
import {userDataAtom, usersAtom} from '@/store/users.ts';
import {useNavigate} from 'react-router-dom';
import {messagesAtom, onlineAtom} from '@/store/chat.ts';
import {UpdateUserEvent, User} from '@/types/user.types.ts';
import {Entries} from '@/types/utils.types.ts';
import {NotificationService} from '@/services/NotificationService.ts';
import {SocketEvent, useSocketEvents} from '@/hooks/useSocketEvents.ts';
import {ErrorMessage} from '@/types/global.types.ts';
import {useEffect} from 'react';
import {MappedChatMessage} from '@/types/chat.types.ts';
import {CookieService} from '@/services/CookieService.ts';
import {SocketService} from '@/services/SocketService.ts';

export default function useWebSocketChat() {
  const userData = useAtomValue(userDataAtom);
  const navigate = useNavigate();

  const [users, setUsers] = useAtom(usersAtom);
  const setOnline = useSetAtom(onlineAtom);
  const setMessages = useSetAtom(messagesAtom);

  function updateUser(data: UpdateUserEvent) {
    const newUsers = structuredClone(users);
    const targetUser = newUsers.find(user => user.id === data.userId);
    if (!targetUser) {
      return;
    }
    const fieldToUpdate = Object.entries(data.update) as Entries<Partial<User>>;
    for (const field of fieldToUpdate) {
      const [key, value] = field ?? [];
      if (!field || !key || !value) {
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      targetUser[key] = value;
    }
    setUsers(newUsers);
  }

  function reconnect() {
    SocketService.reconnect();
    SocketService.socket?.emit('getMessages', {}, (data: []) => {
      console.log({data});
      setMessages(data);
    });
    NotificationService.success('Connection established');
  }

  const events: SocketEvent[] = [
    {
      name: 'online',
      handler: (data: number[]) => {
        setOnline(data);
      },
    },
    {
      name: 'error',
      handler: (data: ErrorMessage) => {
        NotificationService.error(data.message);
      },
    },
    {
      name: 'success',
      handler: () => {
        NotificationService.success('Success');
      },
    },
    {
      name: 'updateUser',
      handler: (data: UpdateUserEvent) => {
        updateUser(data);
      },
    },
    {
      name: 'disconnect',
      handler: () => {
        if (!new CookieService().getToken()) {
          return;
        }
        NotificationService.error('Disconnected', {
          duration: 50000,
          action: {
            label: 'Reconnect',
            onClick: reconnect,
          },
        });
      },
    },
  ];

  useSocketEvents(events);

  useEffect(() => {
    if (!userData) {
      navigate('/login');
    }
    SocketService.socket?.emit('findAllUsers', {}, (data: User[]) => {
      setUsers(data);
    });
    SocketService.socket?.emit('getMessages', {}, (data: MappedChatMessage[]) => {
      setMessages(data);
    });
  }, []);
}
