// THIS FILE IS ENTRY POINT TO SERVER CODE
// To install, run "npm install" in the backend directory
// run "nodemon server" for dev mode

// backend will follow MVC architecture

// IMPORTS
const express = require("express");
const rateLimit = require("express-rate-limit");
// const cron = require('node-cron');
// const axios = require('axios');
require("dotenv").config();
const LLM_API_ROUTES = require("./routes/LLM_api_routes.js");
const cors = require("cors");
const { initializeRedisClient } = require("./services/LLM_config.js");

// APP INITIALIZATION
const app = express();

const port = process.env.PORT || 10000;
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ limit: "4mb", extended: true }));

// middleware
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true); // Allow requests from any origin
  },
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const getClientIp = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return ip.split(',')[0].trim();
};

const promptLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // for 15 min
  max: 20, //limit each ip to this many req
  keyGenerator: (req) => getClientIp(req),
  message: JSON.stringify({ res: "Too many requests, please try again later" })
})

// routing
// LLM API ROUTING to all /LLM endpoints
app.use("/LLM", promptLimiter);
app.use("/LLM", LLM_API_ROUTES);

// cron job to keep the server up
app.get('/refresh', (req, res) => {
  res.status(200).send("OK");
});

// cron.schedule('*/14 * * * *', async () => {
//   try {
//       console.log('Triggering /refresh');
//       const response = await axios.get(`${process.env.URL}/refresh`);
//       console.log('Response:', response.data);
//   } catch (error) {
//       console.error('Error triggering path:', error.message);
//   }
// });

// 404 error catching
app.use((req, res) => {
  res.status(404);
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Initalize redis client with err handling
async function startServer() {
  try {
    await initializeRedisClient();

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server started on port: ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();