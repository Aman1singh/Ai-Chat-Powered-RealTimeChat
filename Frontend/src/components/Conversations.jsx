import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import Conversation from "./Conversation";
import { Users, Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const AI_ASSISTANT = {
    _id: "AI_ASSISTANT_ID",
    fullName: "AI Assistant",
    profilePic: "🤖",
};

const Conversations = ({ showOnlineOnly }) => {
    const { users, isUsersLoading: loading, selectedConversation, setSelectedConversation } = useChatStore();
    const { groups, selectedGroup, selectGroup } = useGroupStore();
    const { onlineUsers } = useAuthStore();
    const [copiedId, setCopiedId] = useState(null);

    const conversations = Array.isArray(users) ? users : [];

    const filteredConversations = showOnlineOnly
        ? conversations.filter(user => user && onlineUsers.includes(user._id))
        : conversations;

    const handleUserClick = (user) => {
        selectGroup(null);
        setSelectedConversation(user);
    };

    const handleGroupClick = (group) => {
        setSelectedConversation(null);
        selectGroup(group);
    };

    const copyGroupId = (e, groupId) => {
        e.stopPropagation();
        navigator.clipboard.writeText(groupId);
        setCopiedId(groupId);
        toast.success("Group ID copied!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className='py-2 flex flex-col overflow-auto'>
            {/* AI Assistant Conversation */}
            <Conversation
                conversation={AI_ASSISTANT}
                isSelected={selectedConversation?._id === AI_ASSISTANT._id}
                onClick={() => {
                    selectGroup(null);
                    setSelectedConversation(AI_ASSISTANT);
                }}
            />

            {/* Groups Section */}
            {groups.length > 0 && (
                <>
                    <div className="px-4 py-2 text-xs font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                        <Users className="size-3" /> Groups
                    </div>
                    {groups.map((group) => (
                        <button
                            key={group._id}
                            onClick={() => handleGroupClick(group)}
                            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                                selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""
                            }`}
                        >
                            <div className="relative mx-auto lg:mx-0">
                                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                                    {group.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                            </div>
                            <div className="hidden lg:block text-left min-w-0 flex-1">
                                <div className="font-medium truncate">{group.name}</div>
                                <div className="text-sm text-zinc-400 flex items-center gap-1">
                                    {group.members?.length || 0} members
                                    <span className="text-[10px] bg-base-300 px-1 rounded font-mono ml-1" title="Click copy button to copy Group ID">
                                        ID: {group._id.slice(-6)}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => copyGroupId(e, group._id)}
                                className="btn btn-ghost btn-circle btn-xs hidden lg:flex"
                                title="Copy full Group ID"
                            >
                                {copiedId === group._id ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                            </button>
                        </button>
                    ))}
                </>
            )}

            {/* Divider */}
            <div className="px-4 py-2 text-xs font-bold text-base-content/50 uppercase tracking-wider">
                Contacts
            </div>

            {/* Render user conversations */}
            {filteredConversations.map((user) => (
                user && (
                    <Conversation
                        key={user._id}
                        conversation={user}
                        isSelected={selectedConversation?._id === user._id}
                        isOnline={onlineUsers.includes(user._id)}
                        onClick={() => handleUserClick(user)}
                    />
                )
            ))}

            {loading && <span className='loading loading-spinner mx-auto'></span>}
        </div>
    );
};
export default Conversations;
