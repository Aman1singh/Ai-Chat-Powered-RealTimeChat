import { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import CodeEditor from "./CodeEditor";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { Image, Send, X, Copy, Check, Users, Info } from "lucide-react";
import toast from "react-hot-toast";

const GroupChatContainer = () => {
  const {
    selectedGroup,
    groupMessages,
    getGroupMessages,
    sendGroupMessage,
    isMessagesLoading,
    subscribeToGroupEvents,
    unsubscribeFromGroupEvents,
    getGroupCode,
  } = useGroupStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
      getGroupCode(selectedGroup._id);
      subscribeToGroupEvents();
    }
    return () => unsubscribeFromGroupEvents();
  }, [selectedGroup?._id]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    await sendGroupMessage({ text: text.trim(), image: imagePreview });
    setText("");
    removeImage();
  };

  const [copied, setCopied] = useState(false);

  const copyGroupId = () => {
    if (!selectedGroup?._id) return;
    navigator.clipboard.writeText(selectedGroup._id);
    setCopied(true);
    toast.success("Group ID copied! Share it with others to join.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* Group ID Banner */}
      <div className="px-4 py-2 bg-base-200/80 border-b border-base-300 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-base-content/70">
          <Info className="size-3.5" />
          <span className="hidden sm:inline">
            Share this Group ID with others so they can join:
          </span>
          <span className="sm:hidden">Group ID:</span>
        </div>
        <div className="flex items-center gap-2">
          <code className="text-xs bg-base-300 px-2 py-0.5 rounded font-mono truncate max-w-[180px] sm:max-w-[300px]">
            {selectedGroup?._id}
          </code>
          <button
            onClick={copyGroupId}
            className="btn btn-ghost btn-circle btn-xs"
            title="Copy Group ID"
          >
            {copied ? (
              <Check className="size-3 text-green-500" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        </div>
      </div>

      {/* Code Editor - takes most space */}
      <div className="flex-[3] min-h-0 p-2">
        <CodeEditor />
      </div>

      {/* Group Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 border-t border-base-300 bg-base-100 min-h-[180px]">
        {isMessagesLoading ? (
          <MessageSkeleton />
        ) : (
          <>
            {groupMessages.map((message) => {
              const fromMe = message.senderId?._id === authUser._id || message.senderId === authUser._id;
              return (
                <div
                  key={message._id}
                  className={`chat ${fromMe ? "chat-end" : "chat-start"}`}
                  ref={messageEndRef}
                >
                  <div className="chat-image avatar">
                    <div className="size-8 rounded-full border">
                      <img
                        src={message.senderId?.profilePic || "/avatar.png"}
                        alt={message.senderId?.fullName || "User"}
                      />
                    </div>
                  </div>
                  <div className="chat-header mb-0.5">
                    <span className="text-xs font-semibold mr-1">
                      {message.senderId?.fullName || "User"}
                    </span>
                    <time className="text-[10px] opacity-50">
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>
                  <div className="chat-bubble chat-bubble-sm flex flex-col">
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[150px] rounded-md mb-1"
                      />
                    )}
                    {message.text && <p className="text-sm">{message.text}</p>}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-3 w-full bg-base-200 border-t border-base-300">
        {imagePreview && (
          <div className="mb-2 flex items-center gap-2">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg border border-zinc-700"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 flex gap-2 items-center">
            <input
              type="text"
              className="w-full input input-bordered rounded-lg input-sm"
              placeholder="Type a message to the group..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button
              type="button"
              className={`hidden sm:flex btn btn-circle btn-sm ${
                imagePreview ? "text-emerald-500" : "text-zinc-400"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={18} />
            </button>
          </div>
          <button
            type="submit"
            className="btn btn-sm btn-circle"
            disabled={!text.trim() && !imagePreview}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChatContainer;

