import {User} from '@/types/user.types.ts';
import {UsersListElement} from '@/components/UsersListElement.tsx';
import {Separator} from '@/components/ui/separator.tsx';

interface IProps {
  data: (User & {online: boolean})[];
}
export default function UsersList({data}: IProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3>Online</h3>
      {data
        .filter(el => el.online)
        .map(user => (
          <UsersListElement key={user.id} {...user} />
        ))}
      <Separator />
      <h3>Offline</h3>
      {data
        .filter(el => !el.online)
        .map(user => (
          <UsersListElement key={user.id} {...user} />
        ))}
    </div>
  );
}
