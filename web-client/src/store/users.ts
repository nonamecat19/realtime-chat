import {LoginUserData} from '@/types/user.types.ts';
import {atom, WritableAtom} from 'jotai';

export const userDataAtom = atomWithLocalStorage<LoginUserData | null>('userData', null);

function atomWithLocalStorage<T = unknown>(
  key: string,
  initialValue: T
): WritableAtom<T, [update: T], void> {
  const getInitialValue = () => {
    const item = localStorage.getItem(key);
    if (item === null) {
      return initialValue;
    }
    try {
      return JSON.parse(item);
    } catch {
      return initialValue;
    }
  };
  const baseAtom = atom(getInitialValue());
  return atom(
    get => get(baseAtom),
    (get, set, update) => {
      const nextValue = typeof update === 'function' ? update(get(baseAtom)) : update;
      set(baseAtom, nextValue);
      localStorage.setItem(key, JSON.stringify(nextValue));
    }
  );
}
