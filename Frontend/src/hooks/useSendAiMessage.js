import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const useSendAiMessage = () => {
    const [loading, setLoading] = useState(false);
    
    const { setAiConversation } = useChatStore(); 
    const { authUser } = useAuthStore();

    const sendAiMessage = async (message) => {
        setLoading(true);
        
        const userMessage = {
            _id: Date.now(),
            senderId: authUser._id,
            text: message,
            image: "",
            createdAt: new Date().toISOString(),
        };

        try {
            // Get last 2 messages from history to send as context
            const currentConversation = useChatStore.getState().aiConversations[authUser._id] || [];
            const lastTwo = currentConversation.slice(-2);
            const history = lastTwo.map((msg) => ({
                role: msg.senderId === "AI_ASSISTANT_ID" ? "model" : "user",
                text: msg.text,
            }));

            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, history }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Something went wrong");

            const aiReply = {
                _id: Date.now() + 1,
                senderId: "AI_ASSISTANT_ID",
                text: data.reply,
                image: "",
                createdAt: new Date().toISOString(),
            };
            
            const updatedConversation = [...currentConversation, userMessage, aiReply];
            setAiConversation(authUser._id, updatedConversation);

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { loading, sendAiMessage };
};

export default useSendAiMessage;
