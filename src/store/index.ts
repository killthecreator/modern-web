import { create } from "zustand";

type State = {
  curPostsNumber: number;
};

type Action = {
  incrementCurPostsCounter: (firstName: State["curPostsNumber"]) => void;
};

const useStore = create<State & Action>((set) => ({
  curPostsNumber: 0,
  incrementCurPostsCounter: (value) => set(() => ({ curPostsNumber: value })),
}));

export default useStore;
