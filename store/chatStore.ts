import { create } from "zustand";
import { ChatMessage } from "@/components/ChatBubble";

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  hasStarted: boolean;
  showWelcome: boolean;
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  setIsTyping: (v: boolean) => void;
  setHasStarted: (v: boolean) => void;
  setShowWelcome: (v: boolean) => void;
}
export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  hasStarted: false,
  showWelcome: true,
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setIsTyping: (isTyping) => set({ isTyping }),
  setHasStarted: (hasStarted) => set({ hasStarted }),
  setShowWelcome: (showWelcome) => set({ showWelcome }),
}));