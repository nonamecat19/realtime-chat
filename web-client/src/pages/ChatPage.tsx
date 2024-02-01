import {SocketEvent, useSocketEvents} from '@/hooks/useSocketEvents.ts';
import {useEffect} from 'react';
import {SocketApi} from '@/api/socket.ts';
import {useConnectSocket} from '@/hooks/useConnectSocket.ts';
import UsersList from '@/components/UsersList.tsx';
import {UpdateUserEvent, User} from '@/types/user.types.ts';
import ChatHeader from '@/components/ChatHeader.tsx';
import {Separator} from '@/components/ui/separator.tsx';
import ChatFooter from '@/components/ChatFooter.tsx';
import {ErrorMessage} from '@/types/global.types.ts';
import {NotificationService} from '@/services/NotificationService.ts';
import {ChatBody} from '@/components/ChatBody.tsx';
import {useAtom, useSetAtom} from 'jotai';
import {onlineAtom} from '@/store/chat.ts';
import {useAtomValue} from 'jotai/index';
import {userDataAtom, usersAtom} from '@/store/users.ts';
import {useNavigate} from 'react-router-dom';
import {Entries} from '@/types/utils.types.ts';

export default function ChatPage() {
  useConnectSocket();
  const userData = useAtomValue(userDataAtom);
  const navigate = useNavigate();

  const [users, setUsers] = useAtom(usersAtom);
  const setOnline = useSetAtom(onlineAtom);

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

  const events: SocketEvent[] = [
    {
      name: 'online',
      handler: data => {
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
  ];

  useSocketEvents(events);

  useEffect(() => {
    if (!userData) {
      navigate('/login');
    }
    SocketApi.socket?.emit('findAllUsers', {}, (data: User[]) => {
      setUsers(data);
    });
  }, []);

  return (
    <section className="flex h-screen">
      <main className="grow h-screen">
        <ChatHeader />
        <ChatBody />
        <ChatFooter />
      </main>
      <aside className="hidden sm:flex w-72 gap-5 mr-5 h-screen overflow-y-scroll">
        <Separator orientation="vertical" />
        <UsersList />
      </aside>
    </section>
  );
}
