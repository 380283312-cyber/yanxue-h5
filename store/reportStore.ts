import { create } from "zustand";

interface ReportFormData {
  name: string;
  school: string;
  grade: string;
  theme: string;
  date: string;
  location: string;
  summary: string;
  base: string;
}

interface ReportState {
  formData: ReportFormData;
  result: string;
  isLoading: boolean;
  setFormData: (data: Partial<ReportFormData>) => void;
  setResult: (result: string) => void;
  setIsLoading: (v: boolean) => void;
  reset: () => void;
}
export const useReportStore = create<ReportState>((set) => ({
  formData: { name: "", school: "", grade: "初一", theme: "", date: "", location: "", summary: "", base: "" },
  result: "",
  isLoading: false,
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  setResult: (result) => set({ result }),
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ formData: { name: "", school: "", grade: "初一", theme: "", date: "", location: "", summary: "", base: "" }, result: "", isLoading: false }),
}));
