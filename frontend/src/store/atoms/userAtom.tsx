import { atom } from "recoil";
import { UserState } from "../../data/Interface";

export const userAtom = atom<UserState | null>({
    key: 'userAtom',
    default: null, // Default state is null (no user logged in)
});