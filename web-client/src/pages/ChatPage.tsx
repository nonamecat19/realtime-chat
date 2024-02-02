import UsersList from '@/components/UsersList.tsx';
import ChatHeader from '@/components/ChatHeader.tsx';
import {Separator} from '@/components/ui/separator.tsx';
import ChatFooter from '@/components/ChatFooter.tsx';
import {ChatBody} from '@/components/ChatBody.tsx';
import useWebSocketChat from '@/hooks/useWebSocketChat.ts';

export default function ChatPage() {
  useWebSocketChat();

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
