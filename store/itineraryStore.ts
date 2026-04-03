import { create } from "zustand";

interface ItineraryFormData {
  destination: string;
  days: string;
  grade: string;
  interest: string;
  intentionBase: string;
}

interface ItineraryState {
  formData: ItineraryFormData;
  result: string;
  isLoading: boolean;
  xiaohongshuContent: string;
  budget: string;
  setFormData: (data: Partial<ItineraryFormData>) => void;
  setResult: (result: string) => void;
  setIsLoading: (v: boolean) => void;
  setXiaohongshuContent: (content: string) => void;
  setBudget: (budget: string) => void;
  reset: () => void;
}
export const useItineraryStore = create<ItineraryState>((set) => ({
  formData: { destination: "西安", days: "1", grade: "初中生", interest: "", intentionBase: "" },
  result: "",
  isLoading: false,
  xiaohongshuContent: "",
  budget: "",
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  setResult: (result) => set({ result }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setXiaohongshuContent: (content) => set({ xiaohongshuContent: content }),
  setBudget: (budget) => set({ budget }),
  reset: () => set({ formData: { destination: "西安", days: "1", grade: "初中生", interest: "", intentionBase: "" }, result: "", isLoading: false, xiaohongshuContent: "", budget: "" }),
}));
