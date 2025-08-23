import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore"; // <-- ADD THIS LINE
import Conversation from "./Conversation";

const AI_ASSISTANT = {
    _id: "AI_ASSISTANT_ID",
    fullName: "AI Assistant",
    profilePic: "🤖",
};

const Conversations = ({ showOnlineOnly }) => {
    const { users, isUsersLoading: loading, selectedConversation, setSelectedConversation } = useChatStore();
    const { onlineUsers } = useAuthStore();

    const conversations = Array.isArray(users) ? users : [];

    const filteredConversations = showOnlineOnly
        ? conversations.filter(user => user && onlineUsers.includes(user._id))
        : conversations;

    return (
        <div className='py-2 flex flex-col overflow-auto'>
            {/* AI Assistant Conversation */}
            <Conversation
                conversation={AI_ASSISTANT}
                isSelected={selectedConversation?._id === AI_ASSISTANT._id}
                onClick={() => setSelectedConversation(AI_ASSISTANT)}
            />

            {/* Render user conversations */}
            {filteredConversations.map((user) => (
                user && (
                    <Conversation
                        key={user._id}
                        conversation={user}
                        isSelected={selectedConversation?._id === user._id}
                        isOnline={onlineUsers.includes(user._id)}
                        onClick={() => setSelectedConversation(user)}
                    />
                )
            ))}

            {loading && <span className='loading loading-spinner mx-auto'></span>}
        </div>
    );
};
export default Conversations;