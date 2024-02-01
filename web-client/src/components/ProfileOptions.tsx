import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar.tsx';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover.tsx';
import {Button} from '@/components/ui/button.tsx';
import {useAtomValue} from 'jotai';
import {userDataAtom} from '@/store/users.ts';
import {Badge} from '@/components/ui/badge.tsx';
import {Separator} from '@/components/ui/separator.tsx';
import {useNavigate} from 'react-router-dom';
import {CookieService} from '@/services/CookieService.ts';

export default function ProfileOptions() {
  const userData = useAtomValue(userDataAtom);
  const navigate = useNavigate();

  function logout() {
    new CookieService().deleteToken();
    navigate('/login');
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar className="w-12 h-12 rounded-md cursor-pointer">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex gap-2">
          <h2>{userData?.nickname}</h2>
          <Badge>{userData?.role}</Badge>
          {userData?.isMuted && <Badge variant="destructive">Muted</Badge>}
        </div>
        <Separator className="my-2" />
        <Button onClick={logout}>Logout</Button>
      </PopoverContent>
    </Popover>
  );
}
