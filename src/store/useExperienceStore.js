import { create } from "zustand";

export const useExperienceStore = create((set) => ({
  isExperienceReady: false,
  setIsExperienceReady: (bool) => set({ bool }),
}));
