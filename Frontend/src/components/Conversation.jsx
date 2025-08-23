const Conversation = ({ conversation, isSelected, isOnline, onClick }) => {
    const isAiChat = conversation._id === "AI_ASSISTANT_ID";

    return (
        <button
            onClick={onClick}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${isSelected ? "bg-base-300" : ""}`}
        >
            <div className="relative mx-auto lg:mx-0">
                <div className="size-12 rounded-full">
                    {isAiChat ? (
                        <div className="flex items-center justify-center h-full text-3xl bg-base-300 rounded-full">
                            {conversation.profilePic}
                        </div>
                    ) : (
                        <img
                            src={conversation.profilePic || "/avatar.png"}
                            alt={conversation.fullName}
                            className="size-12 object-cover rounded-full"
                        />
                    )}
                </div>
                {(isOnline || isAiChat) && (
                    <span
                        className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100"
                    />
                )}
            </div>

            <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-medium truncate">{conversation.fullName}</div>
                <div className="text-sm text-base-content/60">
                    {isAiChat ? "AI Assistant" : isOnline ? "Online" : "Offline"}
                </div>
            </div>
        </button>
    );
};

export default Conversation;
