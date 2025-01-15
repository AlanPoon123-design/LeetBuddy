// do all end point requests here, GET, POST, PUT, DELETE

// Imports
const {
  geminiModel,
  generationConfig,
  getRedisClient,
} = require("../services/LLM_config.js");

// Main AI Response code.
const AIGeneration = async (req, res) => {
  try {
    const { question, image, context, sessionID } = req.body;

    const redisClient = await getRedisClient();

    if (!redisClient) {
      throw new Error("Redis client not initialized");
    }

    if (!question) {
      return res.status(400).send("User Question is required.");
    }

    if (!sessionID) {
      return res.status(400).send("Session ID is required.");
    }

    const redisKey = `chat:${sessionID}`;

    let chatHistoryStr = await redisClient.get(redisKey);
    let chatHistory = [];
    if (chatHistoryStr) {
      // Existing history
      chatHistory = JSON.parse(chatHistoryStr);
    }

    const chatSession = geminiModel.startChat({
      generationConfig,
      history: chatHistory,
    });

    // Create the prompt and push the prompt to history
    let response = "";
    let prompt = "";
    prompt += `Context: ${context}\n\n`;
    prompt += `User Question: ${question}\n\n`;
    prompt += `Instructions: ${process.env.INSTRUCTIONS}`;
    if (!image) {
      chatHistory.push({
        role: "user",
        parts: [{ text: prompt }],
      });

      const result = await chatSession.sendMessage(prompt);
      response = result.response.text();
    } else {
      const prompt_parts = [
        {
          text: prompt,
        },
        {
          inlineData: { mimeType: "image/png", data: image },
        },
      ];

      chatHistory.push({
        role: "user",
        parts: prompt_parts,
      });

      const full_prompt = {
        parts: prompt_parts,
      };

      const result = await geminiModel.generateContent({
        contents: [full_prompt],
      });
      response = result.response.candidates[0].content.parts[0].text;
    }

    chatHistory.push({
      role: "model",
      parts: [{ text: response }],
    });

    await redisClient.set(redisKey, JSON.stringify(chatHistory));
    await redisClient.expire(redisKey, 3600);

    // Send the resonse back to the frontend
    res.send({ res: response });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while generating the response.");
  }
};

// add functions made to the export list
module.exports = {
  AIGeneration,
};
