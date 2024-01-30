import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar.tsx';
import {cn} from '@/lib/utils.ts';
import {User} from '@/types/user.types.ts';

interface IProps extends User {
  online: boolean;
}
export function UsersListElement({online, nicknameColorHEX, nickname}: IProps) {
  return (
    <div className="flex gap-2 items-center">
      <Avatar className="w-10 h-10 rounded-md">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
        <div
          className={cn(
            'w-3 h-3 absolute bottom-0 right-0 rounded-tl-lg border-l border-t border-zinc-700',
            online ? 'bg-green-600' : 'bg-zinc-500'
          )}
        />
      </Avatar>
      <div style={{color: nicknameColorHEX}}>{nickname}</div>
    </div>
  );
}
