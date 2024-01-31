import MessageBlock from '@/components/MessageBlock.tsx';
import {ChatMessage} from '@/types/chat.types.ts';
import {useEffect, useState} from 'react';
import {SocketEvent, useSocketEvents} from '@/hooks/useSocketEvents.ts';
import {SocketApi} from '@/api/socket.ts';

export function ChatBody() {
  const [online, setOnline] = useState<number[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    SocketApi.socket?.emit('getMessages', {}, (data: ChatMessage[]) => {
      setMessages(data);
    });
  }, []);

  const events: SocketEvent[] = [
    {
      name: 'online',
      handler: data => {
        setOnline(data);
      },
    },
    {
      name: 'receiveMessage',
      handler: data => {
        setMessages(prev => [...prev, data]);
      },
    },
  ];

  useSocketEvents(events);

  const mappedMessages: ChatMessage[] = messages.map(message => ({
    ...message,
    user: {
      ...message.user,
      online: online.includes(message.user.id),
    },
  }));

  return (
    <ul className="flex flex-col gap-5 mx-5 h-[calc(100vh-145px)] sm:h-[calc(100vh-125px)] overflow-x-scroll mb-3 pr-5">
      {mappedMessages.map(el => (
        <MessageBlock {...el} key={el.id} />
      ))}
    </ul>
  );
}
