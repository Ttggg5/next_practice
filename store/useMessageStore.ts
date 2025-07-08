// store/useMessageStore.ts
import { create } from 'zustand';

export enum MessageType {
  info = 'info',
  success = 'success',
  error = 'error',
}

interface Message {
  id: number;
  text: string;
  type: MessageType;
}

interface MessageStore {
  messages: Message[];
  addMessage: (text: string, type?: Message['type']) => void;
  removeMessage: (id: number) => void;
}

let idCounter = 0;

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  addMessage: (text, type = MessageType.info) => {
    const id = idCounter++;
    set((state) => ({
      messages: [...state.messages, { id, text, type }]
    }));
    setTimeout(() => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== id)
      }));
    }, 5000); // auto-dismiss after 5s
  },
  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id)
    }))
}));
