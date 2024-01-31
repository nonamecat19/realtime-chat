import {SocketEvent, useSocketEvents} from '@/hooks/useSocketEvents.ts';
import {useEffect, useState} from 'react';
import {SocketApi} from '@/api/socket.ts';
import {ChatMessage} from '@/types/chat.types.ts';
import {Input} from '@/components/ui/input.tsx';
import {Button} from '@/components/ui/button.tsx';
import {useConnectSocket} from '@/hooks/useConnectSocket.ts';
import UsersList from '@/components/UsersList.tsx';
import {MappedUser, User} from '@/types/user.types.ts';
import ChatHeader from '@/components/ChatHeader.tsx';
import {Separator} from '@/components/ui/separator.tsx';
import MessageBlock from '@/components/MessageBlock.tsx';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
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

  async function sendMessageHandle() {
    SocketApi.socket?.emit('sendMessage', {message: userMessage}, () => {
      console.log('sent');
    });
  }

  return (
    <section className="flex flex-col">
      <div className="flex grow">
        <div className="grow">
          <ChatHeader users={mappedUsers} />
          <div className="flex flex-col gap-5 mx-5">
            {mappedMessages.map(el => {
              return <MessageBlock {...el} key={el.id} />;
            })}
          </div>
          <Input value={userMessage} onChange={e => setUserMessage(e.target.value)} />
          <Button onClick={sendMessageHandle} />
        </div>
        <div className="hidden sm:flex w-72 gap-5 mr-5">
          <Separator orientation="vertical" />
          <UsersList data={mappedUsers} />
        </div>
      </div>
    </section>
  );
}
