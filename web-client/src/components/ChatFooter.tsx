import {Input} from '@/components/ui/input.tsx';
import {Button} from '@/components/ui/button.tsx';
import {SocketApi} from '@/api/socket.ts';
import {useState} from 'react';
import {Forward, Timer} from 'lucide-react';
import {useConnectSocket} from '@/hooks/useConnectSocket.ts';

export default function ChatFooter() {
  const [userMessage, setUserMessage] = useState<string>('');
  useConnectSocket();
  const [onTimeout, setOnTimeout] = useState<boolean>(false);

  async function sendMessageHandle() {
    SocketApi.socket?.emit('sendMessage', {message: userMessage});
    setUserMessage('');
    setOnTimeout(true);
    setTimeout(() => {
      setOnTimeout(false);
    }, 15_000);
  }

  return (
    <footer className="flex py-2 px-5 gap-3 h-16">
      <Input value={userMessage} onChange={e => setUserMessage(e.target.value)} className="h-12" />
      <Button
        disabled={userMessage.length === 0 || onTimeout}
        onClick={sendMessageHandle}
        className="h-12"
      >
        {onTimeout ? <Timer /> : <Forward />}
      </Button>
    </footer>
  );
}
