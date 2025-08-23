const express = require("express");

const { getChatResponse } = require("../controllers/chatbot/chat.js");
const router = express.Router();
router.post("/chat", getChatResponse);
module.exports = router;
