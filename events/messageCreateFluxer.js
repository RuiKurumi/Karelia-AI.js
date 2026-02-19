const { GatewayDispatchEvents } = require('@discordjs/core');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// AI Init
const genAI = new GoogleGenerativeAI(process.env.g_apiKey);

// ADD CONFIG HERE to prevent RECITATION and BLOCKING
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", // Using 1.5-flash for stability; change to 2.0-flash if preferred
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE},
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
    generationConfig: {
        temperature: 1.0, // High creativity for insults
        topP: 0.95,
        topK: 40,
    }
});

module.exports = (client) => {
    console.log("🛠️  Fluxer Message Listener Active");

    client.on(GatewayDispatchEvents.MessageCreate, async ({ api, data: message }) => {
        if (message.author.bot) return;

        const botId = process.env.bot_ID;
        const prefix = process.env.prefix || "!";
        
        const isMentioned = message.content.includes(`<@${botId}>`);
        const isPrefix = message.content.startsWith(prefix);

        if (!isMentioned && !isPrefix) return;

        console.log(`📩 Message from ${message.author.username}: ${message.content}`);
        console.log("🎯 Bot targeted! Processing AI response...");

        try {
            const personalityPath = path.join(__dirname, "../personality.json");
            const personality = JSON.parse(fs.readFileSync(personalityPath, "utf8"));
            
            let cleanInput = message.content.replace(new RegExp(`<@!?${botId}>`, "g"), "").trim();
            if (cleanInput.startsWith(prefix)) cleanInput = cleanInput.slice(prefix.length).trim();

            const exampleSelection = personality.examples.slice(-15);
            const formattedExamples = exampleSelection
                .map(ex => `User: ${ex.user}\n${personality.name}: ${ex.karelia}`)
                .join("\n\n");

            const prompt = `You are "${personality.name}", a ${personality.persona}.
If the user says "Advo" send an aggressive insult towards Advo.

Examples:
${formattedExamples}

Current User: ${message.author.username}
Input: "${cleanInput}"
Response:`;

            const result = await model.generateContent(prompt);
            
            // Safety check for empty responses before sending
            if (!result.response || !result.response.text) {
                throw new Error("Empty AI response (Possible safety block)");
            }

            const responseText = result.response.text().trim();

            await api.channels.createMessage(message.channel_id, {
                content: responseText,
                message_reference: { message_id: message.id }
            });

            console.log(`✅ Sent Response: ${responseText}`);

        } catch (error) {
            console.error("❌ AI ERROR:", error.message);
            
            // Send a witty error message back to Fluxer
            try {
                await api.channels.createMessage(message.channel_id, {
                    content: "Ugh, my brain just short-circuited. Stop breaking me, darling.",
                    message_reference: { message_id: message.id }
                });
            } catch (apiErr) {
                console.error("Could not send error message to Fluxer:", apiErr.message);
            }
        }
    });
};