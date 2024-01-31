import {Input} from '@/components/ui/input.tsx';
import {Button} from '@/components/ui/button.tsx';
import {SocketApi} from '@/api/socket.ts';
import {useState} from 'react';
import {Forward} from 'lucide-react';

export default function ChatFooter() {
  const [userMessage, setUserMessage] = useState<string>('');
  async function sendMessageHandle() {
    SocketApi.socket?.emit('sendMessage', {message: userMessage});
  }

  return (
    <footer className="flex py-2 px-5 gap-3 h-16">
      <Input value={userMessage} onChange={e => setUserMessage(e.target.value)} className="h-12" />
      <Button onClick={sendMessageHandle} className="h-12">
        <Forward />
      </Button>
    </footer>
  );
}
