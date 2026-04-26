

// import { X } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";
// import { useChatStore } from "../store/useChatStore";

// const ChatHeader = () => {
//   const { selectedUser, setSelectedUser } = useChatStore();
//   const { onlineUsers } = useAuthStore();

//   return (
//     <div className="p-2.5 border-b border-base-300">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           {/* Avatar */}
//           <div className="avatar">
//             <div className="size-10 rounded-full relative">
//               <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
//             </div>
//           </div>

//           {/* User info */}
//           <div>
//             <h3 className="font-medium">{selectedUser.fullName}</h3>
//             <p className="text-sm text-base-content/70">
//               {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
//             </p>
//           </div>
//         </div>

//         {/* Close button */}
//         <button onClick={() => setSelectedUser(null)}>
//           <X />
//         </button>
//       </div>
//     </div>
//   );
// };
// export default ChatHeader;



import { X, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

const ChatHeader = () => {
    const { selectedConversation, setSelectedConversation } = useChatStore();
    const { selectedGroup, selectGroup, leaveGroup } = useGroupStore();
    const { onlineUsers } = useAuthStore();

    const isAiChat = selectedConversation?._id === "AI_ASSISTANT_ID";
    const isGroupChat = !!selectedGroup;

    const handleLeaveGroup = async () => {
        if (!selectedGroup) return;
        await leaveGroup(selectedGroup._id);
        selectGroup(null);
    };

    const handleClose = () => {
        if (isGroupChat) {
            selectGroup(null);
        } else {
            setSelectedConversation(null);
        }
    };

    const title = isGroupChat
        ? selectedGroup.name
        : selectedConversation?.fullName;

    const subtitle = isGroupChat
        ? `${selectedGroup.members?.length || 0} members`
        : isAiChat
        ? "Always Online"
        : onlineUsers.includes(selectedConversation?._id)
        ? "Online"
        : "Offline";

    const avatar = isGroupChat ? (
        <div className="flex items-center justify-center h-full text-lg font-bold bg-primary/20 text-primary rounded-full">
            {selectedGroup.name.charAt(0).toUpperCase()}
        </div>
    ) : isAiChat ? (
        <div className="flex items-center justify-center h-full text-3xl bg-base-300 rounded-full">
            {selectedConversation.profilePic}
        </div>
    ) : (
        <img src={selectedConversation?.profilePic || "/avatar.png"} alt={title} />
    );

    return (
        <div className="p-2.5 border-b border-base-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="size-10 rounded-full relative">
                            {avatar}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium">{title}</h3>
                        <p className="text-sm text-base-content/70">{subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isGroupChat && (
                        <button
                            onClick={handleLeaveGroup}
                            className="btn btn-ghost btn-sm gap-1 text-error"
                            title="Leave Group"
                        >
                            <LogOut className="size-4" />
                            <span className="hidden sm:inline">Leave</span>
                        </button>
                    )}
                    <button onClick={handleClose} className="btn btn-ghost btn-circle btn-sm">
                        <X className="size-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ChatHeader;
