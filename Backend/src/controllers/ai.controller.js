

import fetch from 'node-fetch';

export const generateAiResponse = async (req, res) => {
    try {
        const { message } = req.body;
        const user = req.user;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "AI API key not configured on the server." });
        }
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        // --- THIS IS THE NEW, MORE SPECIFIC PROMPT ---
        // It strictly defines the AI's role and refusal behavior.
        const prompt = `
            You are a specialized AI assistant for a chat application. Your ONLY function is to help users format their messages to be more professional, clear, or polite.

            RULES:
            1.  If the user's message is a request to rephrase, correct, or improve a piece of text, you must provide the improved version and nothing else.
            2.  If the user asks a question, tries to make small talk, or requests any information on any topic other than message formatting, you MUST respond with EXACTLY this sentence: "I can only assist with formatting messages. Please provide a message you would like me to improve."
            3.  Do not greet the user or add any extra conversational text. Only provide the formatted message or the refusal message.

            EXAMPLES:
            - User input: "rephrase this for my boss: i cant come in today"
            - Your correct response: "I will be unable to come in to work today."

            - User input: "fix grammar: he dont know what hes doing"
            - Your correct response: "He doesn't know what he's doing."

            - User input: "What is the capital of France?"
            - Your correct response: "I can only assist with formatting messages. Please provide a message you would like me to improve."

            - User input: "Hello, how are you?"
            - Your correct response: "I can only assist with formatting messages. Please provide a message you would like me to improve."

            Now, process the following user input based on these rules.
            User's name: ${user.fullName}
            User's message: "${message}"
        `;

        const payload = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error("AI API Error:", errorText);
            return res.status(500).json({ error: "Failed to get response from AI service." });
        }

        const result = await apiResponse.json();
        const aiText = result.candidates[0]?.content?.parts[0]?.text;

        if (!aiText) {
            return res.status(500).json({ error: "Could not extract AI response text." });
        }

        res.status(200).json({ reply: aiText.trim() });

    } catch (error) {
        console.error("Error in generateAiResponse controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
