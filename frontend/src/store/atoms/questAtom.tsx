import { atom } from "recoil";
import { QuestState } from "../../data/Interface";

export const questAtom = atom<QuestState[] | null>({
    key: 'questAtom',
    default: [], // Default state is null (no user logged in)
});