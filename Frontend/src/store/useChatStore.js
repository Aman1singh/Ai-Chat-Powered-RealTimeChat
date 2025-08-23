import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    // CHANGE: This is now an object to hold multiple AI conversations
    aiConversations: {}, 
    users: [],
    selectedConversation: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    // CHANGE: This function now updates the conversation for a specific user ID
    setAiConversation: (userId, messages) => {
        set(state => ({
            aiConversations: {
                ...state.aiConversations,
                [userId]: messages,
            }
        }));
    },
    
    setMessages: (messages) => set({ messages }),

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        if (userId === "AI_ASSISTANT_ID") {
            set({ messages: [], isMessagesLoading: false });
            return;
        }
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch messages");
            set({ messages: [] });
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedConversation, messages } = get();
        if (!selectedConversation) return;
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedConversation._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },

    subscribeToMessages: () => {
        const { selectedConversation } = get();
        if (!selectedConversation || selectedConversation._id === "AI_ASSISTANT_ID") return;
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
        socket.on("newMessage", (newMessage) => {
            if (newMessage.senderId === selectedConversation._id) {
                set({ messages: [...get().messages, newMessage] });
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) socket.off("newMessage");
    },

    setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
}));
