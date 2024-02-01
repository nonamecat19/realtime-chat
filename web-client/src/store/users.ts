import {atom} from 'jotai';
import {LoginUserData} from '@/types/user.types.ts';

export const userDataAtom = atom<LoginUserData | null>(null);
