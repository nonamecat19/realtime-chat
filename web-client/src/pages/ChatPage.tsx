import {SocketEvent, useSocketEvents} from '@/hooks/useSocketEvents.ts';
import {useEffect, useState} from 'react';
import {SocketApi} from '@/api/socket.ts';
import {useConnectSocket} from '@/hooks/useConnectSocket.ts';
import UsersList from '@/components/UsersList.tsx';
import {MappedUser, User} from '@/types/user.types.ts';
import ChatHeader from '@/components/ChatHeader.tsx';
import {Separator} from '@/components/ui/separator.tsx';
import ChatFooter from '@/components/ChatFooter.tsx';
import {ErrorMessage} from '@/types/global.types.ts';
import {NotificationService} from '@/services/NotificationService.ts';
import {ChatBody} from '@/components/ChatBody.tsx';

export default function ChatPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [online, setOnline] = useState<number[]>([]);

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
  ];

  useSocketEvents(events);
  useConnectSocket();

  const mappedUsers: MappedUser[] = users.map(user => ({
    ...user,
    online: online.includes(user.id),
  }));

  useEffect(() => {
    SocketApi.socket?.emit('findAllUsers', {}, (data: User[]) => {
      setUsers(data);
    });
  }, []);

  return (
    <section className="flex h-screen">
      <main className="grow h-screen">
        <ChatHeader users={mappedUsers} />
        <ChatBody />
        <ChatFooter />
      </main>
      <aside className="hidden sm:flex w-72 gap-5 mr-5 h-screen overflow-y-scroll">
        <Separator orientation="vertical" />
        <UsersList data={mappedUsers} />
      </aside>
    </section>
  );
}
