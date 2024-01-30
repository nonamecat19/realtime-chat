import {SocketEvent, useSocketEvents} from '@/hooks/useSocketEvents.ts';
import {useEffect, useState} from 'react';
import {SocketApi} from '@/api/socket.ts';
import {ChatMessage} from '@/types/chat.types.ts';
import {Input} from '@/components/ui/input.tsx';
import {Button} from '@/components/ui/button.tsx';
import {useConnectSocket} from '@/hooks/useConnectSocket.ts';
import UsersList from '@/components/UsersList.tsx';
import {User} from '@/types/user.types.ts';
import ChatHeader from '@/components/ChatHeader.tsx';
import {Separator} from '@/components/ui/separator.tsx';
import MessageBlock from '@/components/MessageBlock.tsx';

const usersMock: (User & {online: boolean})[] = new Array(10).fill(null).map(() => {
  return {
    id: Math.random(),
    role: 'USER',
    nickname: 'asdfwe rwe rjlkjlsaf',
    nicknameColorHEX: '#000000',
    isBanned: false,
    isMuted: false,
    online: Math.random() > 0.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
});

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');

  const events: SocketEvent[] = [
    {
      name: 'receiveMessage',
      handler: data => {
        setMessages(prev => [...prev, data]);
      },
    },
  ];

  useSocketEvents(events);
  useConnectSocket();

  useEffect(() => {
    SocketApi.socket?.emit('getMessages', {}, (data: ChatMessage[]) => {
      setMessages(data);
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
          <ChatHeader />
          <div className="flex flex-col gap-5 mx-5">
            {messages.map(el => {
              return <MessageBlock {...el} key={el.id} online={false} />;
            })}
          </div>
          <Input value={userMessage} onChange={e => setUserMessage(e.target.value)} />
          <Button onClick={sendMessageHandle} />
        </div>
        <div className="hidden sm:flex w-72 gap-5 mr-5">
          <Separator orientation="vertical" />
          <UsersList data={usersMock} />
        </div>
      </div>
    </section>
  );
}
