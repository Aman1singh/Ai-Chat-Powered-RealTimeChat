import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  groupCode: "",
  remoteCursors: {},
  isGroupsLoading: false,
  isMessagesLoading: false,

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups/my-groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (data) => {
    try {
      const res = await axiosInstance.post("/groups/create", data);
      set((state) => ({ groups: [res.data, ...state.groups] }));
      toast.success("Group created successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      return null;
    }
  },

  joinGroup: async (data) => {
    try {
      const res = await axiosInstance.post("/groups/join", data);
      set((state) => {
        const exists = state.groups.find((g) => g._id === res.data._id);
        if (exists) return state;
        return { groups: [res.data, ...state.groups] };
      });
      toast.success("Joined group successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join group");
      return null;
    }
  },

  selectGroup: (group) => {
    set({ selectedGroup: group, groupMessages: [], groupCode: "", remoteCursors: {} });
  },

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendGroupMessage: async (messageData) => {
    const { selectedGroup, groupMessages } = get();
    if (!selectedGroup) return;
    try {
      const res = await axiosInstance.post(`/groups/${selectedGroup._id}/messages`, messageData);
      set({ groupMessages: [...groupMessages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
      }));
      toast.success("Left group");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
    }
  },

  getGroupCode: async (groupId) => {
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/code`);
      set({ groupCode: res.data.codeContent });
    } catch (error) {
      console.log("Error fetching group code:", error.message);
    }
  },

  updateGroupCode: async (groupId, codeContent) => {
    try {
      await axiosInstance.put(`/groups/${groupId}/code`, { codeContent });
    } catch (error) {
      console.log("Error updating group code:", error.message);
    }
  },

  setGroupCode: (code) => set({ groupCode: code }),

  setRemoteCursors: (cursors) => set({ remoteCursors: cursors }),

  subscribeToGroupEvents: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.emit("join-group", selectedGroup._id);

    socket.off("newGroupMessage");
    socket.on("newGroupMessage", (newMessage) => {
      set((state) => ({ groupMessages: [...state.groupMessages, newMessage] }));
    });

    socket.off("code-change");
    socket.on("code-change", ({ codeContent }) => {
      set({ groupCode: codeContent });
    });

    socket.off("cursor-move");
    socket.on("cursor-move", ({ cursorPosition, username, color, userId }) => {
      set((state) => ({
        remoteCursors: {
          ...state.remoteCursors,
          [userId]: { position: cursorPosition, username, color },
        },
      }));
    });

    socket.off("memberLeft");
    socket.on("memberLeft", ({ userId }) => {
      set((state) => {
        const newCursors = { ...state.remoteCursors };
        delete newCursors[userId];
        return { remoteCursors: newCursors };
      });
    });

    socket.off("groupDeleted");
    socket.on("groupDeleted", (groupId) => {
      if (selectedGroup._id === groupId) {
        set({ selectedGroup: null, groupMessages: [], groupCode: "" });
        toast.error("Group was deleted");
      }
      set((state) => ({ groups: state.groups.filter((g) => g._id !== groupId) }));
    });
  },

  unsubscribeFromGroupEvents: () => {
    const { selectedGroup } = get();
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    if (selectedGroup) {
      socket.emit("leave-group", selectedGroup._id);
    }

    socket.off("newGroupMessage");
    socket.off("code-change");
    socket.off("cursor-move");
    socket.off("memberLeft");
    socket.off("groupDeleted");
  },
}));

