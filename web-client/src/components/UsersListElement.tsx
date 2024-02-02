import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar.tsx';
import {cn} from '@/lib/utils.ts';
import {MappedUser} from '@/types/user.types.ts';
import {useAtomValue} from 'jotai';
import {userDataAtom} from '@/store/users.ts';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover.tsx';
import {Button} from '@/components/ui/button.tsx';
import {socketService} from '@/services/SocketService.ts';

const STATUS_TYPE = {
  BAN: 'BAN',
  MUTE: 'MUTE',
} as const;

const MESSAGE_BY_STATUS = {
  [STATUS_TYPE.BAN]: 'setBanStatus',
  [STATUS_TYPE.MUTE]: 'setMuteStatus',
} as const;

interface Props extends MappedUser {}

export function UsersListElement({
  online,
  nicknameColorHEX,
  nickname,
  isMuted,
  isBanned,
  id,
}: Props) {
  const userData = useAtomValue(userDataAtom);
  const isAdmin = userData?.role === 'ADMIN';

  function setStatus(type: keyof typeof STATUS_TYPE, status: boolean) {
    socketService.socket?.emit(MESSAGE_BY_STATUS[type], {status, userId: id});
  }

  function AdminButtons() {
    if (!isAdmin) {
      return null;
    }

    return (
      <div className="flex flex-col gap-2">
        <Button onClick={() => setStatus(STATUS_TYPE.MUTE, !isMuted)}>
          {isMuted ? 'Unmute' : 'Mute'}
        </Button>
        <Button onClick={() => setStatus(STATUS_TYPE.BAN, !isBanned)}>
          {isBanned ? 'Unban' : 'Ban'}
        </Button>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex gap-2 items-center hover:bg-zinc-50 duration-200">
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
      </PopoverTrigger>
      <PopoverContent>
        Nickname: {nickname}
        <AdminButtons />
      </PopoverContent>
    </Popover>
  );
}
