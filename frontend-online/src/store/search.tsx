import { create } from "zustand";

type SearchState = {
    keyword: string;
    dataSource: any[];
    types1: any[];
    types2: any[];
    hasSearched: boolean;
    setKeyword: (value: string) => void;
    setDataSource: (value: any[]) => void;
    setTypes1: (value: any[]) => void;
    setTypes2: (value: any[]) => void;
    setHasSearched: (value: boolean) => void;
    reset: () => void;
};

export const useSearchStore = create<SearchState>((set) => ({
    keyword: "",
    dataSource: [],
    types1: [],
    types2: [],
    hasSearched: false,
    setKeyword: (value) => set({ keyword: value }),
    setDataSource: (value) => set({ dataSource: value }),
    setTypes1: (value) => set({ types1: value }),
    setTypes2: (value) => set({ types2: value }),
    setHasSearched: (value) => set({ hasSearched: value }),
    reset: () =>
        set({
            keyword: "",
            dataSource: [],
            types1: [],
            types2: [],
            hasSearched: false,
        }),
}));
