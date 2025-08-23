const express = require("express");

const { getChatResponse } = require("../controllers/chatbot/chat.js");
const router = express.Router();
router.post("/chatBot", getChatResponse);
module.exports = router;
