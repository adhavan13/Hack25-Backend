const { getResponseText } = require("../../utils/chatbot");

const getChatResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: "Text input is required" });
    }

    const response = await getResponseText(prompt);
    res.json({ response });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { getChatResponse };
