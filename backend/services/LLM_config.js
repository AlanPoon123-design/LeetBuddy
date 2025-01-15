const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("redis");

// API Info (keep .env private)
const geminiAPIKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiAPIKey);

// Information
const geminiModel = genAI.getGenerativeModel({
  model: process.env.MODEL || "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Redis client for Cohere Chat History
let redisClient = null;

const redisReady = (async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://redis:6379",
    });

    redisClient.on("error", (err) => console.error("Redis Client Error:", err));

    try {
      await redisClient.connect();
      console.log("Connected to redis.");
    } catch (err) {
      console.error("Error connecting to Redis:", err);
      redisClient = null;
      throw err;
    }
  }
  return redisClient;
})();

module.exports = {
  geminiModel,
  generationConfig,
  getRedisClient: async () => {
    await redisReady;
    return redisClient;
  },
  initializeRedisClient: () => redisReady,
};
