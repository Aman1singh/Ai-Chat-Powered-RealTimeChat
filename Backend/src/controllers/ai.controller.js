import fetch from 'node-fetch';

export const generateAiResponse = async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        const user = req.user;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "AI API key not configured on the server." });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        // Build contents array with only last 2 history messages + current message
        const contents = [];

        // Add last 2 history messages only
        const recentHistory = history.slice(-2);
        recentHistory.forEach((h) => {
            contents.push({
                role: h.role === "model" ? "model" : "user",
                parts: [{ text: h.text }],
            });
        });

        // Add current user message with concise instruction
        contents.push({
            role: "user",
            parts: [{
                text: `You are a helpful AI assistant. Keep your response very short and concise (1-2 sentences max). Do not use bullet points or lists unless asked. Be direct and to the point.\n\nUser: ${message}`
            }],
        });

        const payload = { contents };

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

