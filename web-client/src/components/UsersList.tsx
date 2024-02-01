import {UsersListElement} from '@/components/UsersListElement.tsx';
import {Separator} from '@/components/ui/separator.tsx';
import {useAtomValue} from 'jotai';
import {mappedOfflineUsersAtom, mappedOnlineUsersAtom} from '@/store/users.ts';

export default function UsersList() {
  const mappedOnlineUsers = useAtomValue(mappedOnlineUsersAtom);
  const mappedOfflineUsers = useAtomValue(mappedOfflineUsersAtom);

  return (
    <div className="flex flex-col gap-2 grow mt-3">
      <h3 className="text-emerald-700">Online</h3>
      {mappedOnlineUsers.map(user => (
        <UsersListElement key={user.id} {...user} />
      ))}
      {mappedOfflineUsers.length ? (
        <>
          <Separator />
          <h3 className="text-red-700">Offline</h3>
          {mappedOfflineUsers.map(user => (
            <UsersListElement key={user.id} {...user} />
          ))}
        </>
      ) : null}
    </div>
  );
}
