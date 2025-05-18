import { create } from "zustand";

interface VideoDataState {
  videoTitle: string;
  videoAuthor: string;
  setVideoTitle: (title: string) => void;
  setVideoAuthor: (author: string) => void;
}

export const useVideoDataStore = create<VideoDataState>()((set) => ({
  videoTitle: "",
  videoAuthor: "",
  setVideoTitle: (title) => set({ videoTitle: title }),
  setVideoAuthor: (author) => set({ videoAuthor: author }),
}));
