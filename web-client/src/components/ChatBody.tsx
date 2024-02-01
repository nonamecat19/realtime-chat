import MessageBlock from '@/components/MessageBlock.tsx';
import {MappedChatMessage} from '@/types/chat.types.ts';
import {useEffect, useRef} from 'react';
import {SocketEvent, useSocketEvents} from '@/hooks/useSocketEvents.ts';
import {SocketApi} from '@/api/socket.ts';
import {useAtomValue, useSetAtom} from 'jotai';
import {mappedMessagesAtom, messagesAtom, onlineAtom} from '@/store/chat.ts';
import {useConnectSocket} from '@/hooks/useConnectSocket.ts';

export function ChatBody() {
  const setOnline = useSetAtom(onlineAtom);
  const setMessages = useSetAtom(messagesAtom);
  const mappedMessages = useAtomValue(mappedMessagesAtom);

  const messagesContainerRef = useRef<HTMLUListElement>(null);

  useConnectSocket();

  useEffect(() => {
    SocketApi.socket?.emit('getMessages', {}, (data: MappedChatMessage[]) => {
      console.log({data});
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
        setTimeout(() => {
          const container = messagesContainerRef.current;
          if (!container) {
            return;
          }
          container.scrollTop = container.scrollHeight;
        }, 200);
      },
    },
  ];

  useSocketEvents(events);

  return (
    <ul
      className="flex flex-col gap-5 mx-5 h-[calc(100vh-145px)] sm:h-[calc(100vh-125px)] overflow-x-scroll mb-3 pr-5 scroll-smooth"
      ref={messagesContainerRef}
    >
      {mappedMessages.map(el => (
        <MessageBlock {...el} key={el.id} />
      ))}
    </ul>
  );
}
