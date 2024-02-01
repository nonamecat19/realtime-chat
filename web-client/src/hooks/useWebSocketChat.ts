import {useAtom, useAtomValue, useSetAtom} from 'jotai';
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
  const [online, setOnline] = useAtom(onlineAtom);
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

  // function reconnect() {
  //   SocketService.reconnect();
  //   SocketService.socket?.emit('getMessages', {}, (data: []) => {
  //     console.log({data});
  //     setMessages(data);
  //   });
  // }

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
        if (data.status === 401) {
          new CookieService().deleteToken();
          navigate('/login');
          NotificationService.error('Auth error');
          return;
        }
        if (data.status === 403) {
          NotificationService.error('Permission error');
          return;
        }
        if (data.status >= 500) {
          NotificationService.error('Server error');
          return;
        }
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
        navigate('/login');
        // if (!new CookieService().getToken()) {
        //   return;
        // }
        // NotificationService.error('Disconnected', {
        //   duration: 50000,
        //   action: {
        //     label: 'Reconnect',
        //     onClick: reconnect,
        //   },
        // });
      },
    },
    {
      name: 'userLogin',
      handler: (newUser: User) => {
        const userIndex = users.findIndex(user => user.id === newUser.id);
        if (userIndex === -1) {
          setUsers(prev => [...prev, newUser]);
        } else {
          const oldUser = structuredClone(users);
          oldUser[userIndex] = newUser;
          setUsers(oldUser);
        }
        if (online.includes(newUser.id)) {
          return;
        }
        setOnline([...online, newUser.id]);
      },
    },
    {
      name: 'userLogout',
      handler: (userId: number) => {
        setOnline(online.filter(el => el !== userId));
        SocketService.socket?.emit('findAllUsers', {}, (data: User[]) => {
          setUsers(data);
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
