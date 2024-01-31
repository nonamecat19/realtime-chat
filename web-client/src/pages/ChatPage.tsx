import {SocketEvent, useSocketEvents} from '@/hooks/useSocketEvents.ts';
import {useEffect, useState} from 'react';
import {SocketApi} from '@/api/socket.ts';
import {ChatMessage} from '@/types/chat.types.ts';
import {useConnectSocket} from '@/hooks/useConnectSocket.ts';
import UsersList from '@/components/UsersList.tsx';
import {MappedUser, User} from '@/types/user.types.ts';
import ChatHeader from '@/components/ChatHeader.tsx';
import {Separator} from '@/components/ui/separator.tsx';
import MessageBlock from '@/components/MessageBlock.tsx';
import ChatFooter from '@/components/ChatFooter.tsx';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [online, setOnline] = useState<number[]>([]);

  const events: SocketEvent[] = [
    {
      name: 'receiveMessage',
      handler: data => {
        setMessages(prev => [...prev, data]);
      },
    },
    {
      name: 'online',
      handler: data => {
        setOnline(data);
      },
    },
    {
      name: 'error',
      handler: data => {
        console.error(data);
      },
    },
  ];

  useSocketEvents(events);
  useConnectSocket();

  const mappedUsers: MappedUser[] = users.map(user => ({
    ...user,
    online: online.includes(user.id),
  }));

  const mappedMessages: ChatMessage[] = messages.map(message => ({
    ...message,
    user: {
      ...message.user,
      online: online.includes(message.user.id),
    },
  }));

  useEffect(() => {
    SocketApi.socket?.emit('getMessages', {}, (data: ChatMessage[]) => {
      setMessages(data);
    });
    SocketApi.socket?.emit('findAllUsers', {}, (data: User[]) => {
      setUsers(data);
    });
  }, []);

  return (
    <section className="flex h-screen">
      <main className="grow h-screen">
        <ChatHeader users={mappedUsers} />
        <ul className="flex flex-col gap-5 mx-5 h-[calc(100vh-145px)] sm:h-[calc(100vh-125px)] overflow-x-scroll mb-3 pr-5">
          {mappedMessages.map(el => {
            return <MessageBlock {...el} key={el.id} />;
          })}
        </ul>
        <ChatFooter />
      </main>
      <aside className="hidden sm:flex w-72 gap-5 mr-5 h-screen overflow-y-scroll">
        <Separator orientation="vertical" />
        <UsersList data={mappedUsers} />
      </aside>
    </section>
  );
}
