import {SocketEvent, useSocketEvents} from '@/hooks/useSocketEvents.ts';
import {useEffect} from 'react';
import {SocketApi} from '@/api/socket.ts';
import {useConnectSocket} from '@/hooks/useConnectSocket.ts';
import UsersList from '@/components/UsersList.tsx';
import {User} from '@/types/user.types.ts';
import ChatHeader from '@/components/ChatHeader.tsx';
import {Separator} from '@/components/ui/separator.tsx';
import ChatFooter from '@/components/ChatFooter.tsx';
import {ErrorMessage} from '@/types/global.types.ts';
import {NotificationService} from '@/services/NotificationService.ts';
import {ChatBody} from '@/components/ChatBody.tsx';
import {useSetAtom} from 'jotai';
import {onlineAtom, usersAtom} from '@/store/chat.ts';

export default function ChatPage() {
  useConnectSocket();

  const setUsers = useSetAtom(usersAtom);
  const setOnline = useSetAtom(onlineAtom);

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

  useEffect(() => {
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
