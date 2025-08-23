import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
    const {
        messages,
        aiConversations, // CHANGE: Get the conversations object
        getMessages,
        isMessagesLoading,
        selectedConversation,
        subscribeToMessages,
        unsubscribeFromMessages,
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);

    const isAiChat = selectedConversation?._id === "AI_ASSISTANT_ID";

    // CHANGE: Select the correct conversation based on the logged-in user's ID
    const messageList = isAiChat ? aiConversations[authUser._id] : messages;
    
    const safeMessageList = Array.isArray(messageList) ? messageList : [];

    useEffect(() => {
        if (selectedConversation?._id) {
            getMessages(selectedConversation._id);
            subscribeToMessages();
        }
        return () => unsubscribeFromMessages();
    }, [selectedConversation?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [safeMessageList]);

    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader />
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {safeMessageList.map((message) => {
                    const fromMe = message.senderId === authUser._id;
                    const isFromAI = message.senderId === "AI_ASSISTANT_ID";
                    let profilePic;
                    if (fromMe) {
                        profilePic = authUser.profilePic || "/avatar.png";
                    } else if (isFromAI) {
                        profilePic = "🤖";
                    } else {
                        profilePic = selectedConversation?.profilePic || "/avatar.png";
                    }
                    return (
                        <div key={message._id} className={`chat ${fromMe ? "chat-end" : "chat-start"}`} ref={messageEndRef}>
                            <div className="chat-image avatar">
                                <div className="size-10 rounded-full border">
                                    {isFromAI ? (
                                        <div className="flex items-center justify-center h-full text-2xl bg-base-300 rounded-full">{profilePic}</div>
                                    ) : (
                                        <img src={profilePic} alt="profile pic" />
                                    )}
                                </div>
                            </div>
                            <div className="chat-header mb-1">
                                <time className="text-xs opacity-50 ml-1">{formatMessageTime(message.createdAt)}</time>
                            </div>
                            <div className="chat-bubble flex flex-col">
                                {message.image && <img src={message.image} alt="Attachment" className="sm:max-w-[200px] rounded-md mb-2" />}
                                {message.text && <p>{message.text}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
            <MessageInput />
        </div>
    );
};
export default ChatContainer;
