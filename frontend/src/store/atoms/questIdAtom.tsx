import { atom } from "recoil";

export const questIdAtom = atom<string | null>({
    key: 'questIdAtom',
    default: null, // Default state is null (no user logged in)
});