

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



import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
    const { selectedConversation, setSelectedConversation } = useChatStore(); // Use selectedConversation
    const { onlineUsers } = useAuthStore();
    const isAiChat = selectedConversation._id === "AI_ASSISTANT_ID";

    return (
        <div className="p-2.5 border-b border-base-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="size-10 rounded-full relative">
                            {isAiChat ? (
                                <div className="flex items-center justify-center h-full text-3xl bg-base-300 rounded-full">
                                    {selectedConversation.profilePic}
                                </div>
                            ) : (
                                <img src={selectedConversation.profilePic || "/avatar.png"} alt={selectedConversation.fullName} />
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium">{selectedConversation.fullName}</h3>
                        <p className="text-sm text-base-content/70">
                            {isAiChat ? "Always Online" : onlineUsers.includes(selectedConversation._id) ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>
                <button onClick={() => setSelectedConversation(null)}>
                    <X />
                </button>
            </div>
        </div>
    );
};
export default ChatHeader;