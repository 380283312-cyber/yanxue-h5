import { create } from "zustand";
import { ChatMessage } from "@/components/ChatBubble";

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  hasStarted: boolean;
  showWelcome: boolean;
  setMessages: (msgs: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
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
  setMessages: (messages) => set((state) => ({ messages: typeof messages === 'function' ? messages(state.messages) : messages })),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setIsTyping: (isTyping) => set({ isTyping }),
  setHasStarted: (hasStarted) => set({ hasStarted }),
  setShowWelcome: (showWelcome) => set({ showWelcome }),
}));