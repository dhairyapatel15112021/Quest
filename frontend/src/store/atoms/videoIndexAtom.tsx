import { atom } from "recoil";

export const videoIndexAtom = atom<number>({
    key: 'videoIndexAtom',
    default: 0, // Default state is null (no user logged in)
});