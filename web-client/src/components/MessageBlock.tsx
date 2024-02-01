import {MappedChatMessage} from '@/types/chat.types.ts';
import {addHours, format} from 'date-fns';
import {Avatar, AvatarFallback, AvatarImage} from './ui/avatar';
import {Badge} from '@/components/ui/badge.tsx';
import {cn} from '@/lib/utils.ts';
import {HoverCard, HoverCardContent, HoverCardTrigger} from './ui/hover-card';
import {CalendarDays} from 'lucide-react';

interface IProps extends MappedChatMessage {}
export default function MessageBlock({message, user, createdAt}: IProps) {
  return (
    <li className="p-2 bg-zinc-50 shadow-md border-2 border-zinc-200 rounded-lg flex gap-5">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Avatar className="w-12 h-12 rounded-md cursor-pointer">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
            <div
              className={cn(
                'w-4 h-4 absolute bottom-0 right-0 rounded-tl-lg border-l border-t border-zinc-700',
                user.online ? 'bg-green-600' : 'bg-zinc-500'
              )}
            />
          </Avatar>
        </HoverCardTrigger>
        <HoverCardContent className="ml-4 w-60">
          <div className="flex justify-between space-x-4">
            <div className="space-y-1">
              <div className="flex gap-2">
                <p className="text-sm">{user.nickname}</p>
                <Badge>{user.role}</Badge>
              </div>
              <div className="flex items-center pt-2">
                <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{' '}
                <span className="text-xs text-muted-foreground">
                  Joined {format(user.createdAt, 'MMMM yyyy')}
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      <div className="flex flex-col justify-between gap-3.5 grow">
        <div className="flex justify-between w-full">
          <div className="flex gap-3">
            <span
              style={{
                color: user.nicknameColorHEX,
              }}
            >
              {user.nickname}
            </span>
            {user.role === 'ADMIN' ? <Badge variant="outline">Admin</Badge> : null}
            {user.isMuted ? <Badge variant="destructive">Muted</Badge> : null}
            {user.isBanned ? <Badge variant="destructive">Banned</Badge> : null}
          </div>
          <span className="text-zinc-500">{format(addHours(createdAt, 2), 'HH:mm')}</span>
        </div>
        <div>{message}</div>
      </div>
    </li>
  );
}
