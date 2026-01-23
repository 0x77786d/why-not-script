import { create } from "zustand";

type UIState = {
    hasReadAgreement: boolean;
    setHasReadAgreement: (value: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
    hasReadAgreement: false,
    setHasReadAgreement: (value) => set({ hasReadAgreement: value }),
}));
