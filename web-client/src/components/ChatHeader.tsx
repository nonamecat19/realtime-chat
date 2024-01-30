import {Sheet, SheetContent, SheetHeader, SheetTrigger} from '@/components/ui/sheet.tsx';
import {AlignJustify} from 'lucide-react';
import {User} from '@/types/user.types.ts';
import UsersList from '@/components/UsersList.tsx';

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

export default function ChatHeader() {
  return (
    <header className="flex justify-between items-center h-16 sm:h-12">
      <h1 className="ml-5 text-4xl sm:text-2xl font-bold">Chat app</h1>

      <div className="block sm:hidden">
        <Sheet>
          <SheetTrigger className="p-2">
            <AlignJustify className="p-2 h-12 w-12 bg-zinc-900 rounded-lg text-white" />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <h2 className="text-2xl font-bold mb-5">Users</h2>
            </SheetHeader>
            <UsersList data={usersMock} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
