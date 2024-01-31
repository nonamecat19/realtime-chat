import {Sheet, SheetContent, SheetHeader, SheetTrigger} from '@/components/ui/sheet.tsx';
import {AlignJustify} from 'lucide-react';
import {MappedUser} from '@/types/user.types.ts';
import UsersList from '@/components/UsersList.tsx';

interface IProps {
  users: MappedUser[];
}
export default function ChatHeader({users}: IProps) {
  return (
    <header className="flex justify-between items-center h-16 sm:h-12 border-b">
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
            <UsersList data={users} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
