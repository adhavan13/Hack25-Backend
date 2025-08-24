const GoogleGenerativeAI = require("@google/generative-ai");
const dotenv = require("dotenv");
const priviousMessageSchema = require("../models/chatbotHistory");
const ChathistorySchema = require("../models/chatbot");
dotenv.config();

// Initialize Gemini Model
const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(
  "AIzaSyBkL0EgwyaV03rwcNTNnb75Wld1fK_MxaM"
);

async function getPreviousMessage() {
  try {
    const previousMessages = await priviousMessageSchema
      .find()
      .sort({ createdAt: -1 });
    return previousMessages;
  } catch (error) {
    console.error(
      "Error fetching previous messages:",
      error.message,
      error.stack
    );
    return [];
  }
}
async function saveMessage(message) {
  try {
    const newMessage = new priviousMessageSchema({ message });
    await newMessage.save();
    console.log("Message saved successfully:", message);
  } catch (error) {
    console.error("Error saving message:", error.message, error.stack);
  }
}
async function saveChatHistory(user, model) {
  try {
    const newMessage = new ChathistorySchema({ user, model });
    await newMessage.save();
  } catch (error) {
    console.error("Error saving message:", error.message, error.stack);
  }
}
async function combineMessages(messages) {
  let priviousMessages = await getPreviousMessage();
  console.log(priviousMessages);

  const queryToCombine = `Here is the previous chat history between the user and the assistant. Please take this into account along with the current user question, and generate a query that is contextually relevant and coherent with the ongoing conversation.

    Chat History:
    ${priviousMessages.length > 0 ? priviousMessages : ""}
    
    Current Query:
    ${messages}
    
    Based on both the history and the current query, provide a well-formed and context-aware response.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const response = await model.generateContent(queryToCombine);
    const resultText = response.response.candidates[0].content.parts[0].text;

    return resultText;
  } catch (error) {
    console.error("Error details:", error.message, error.stack);
    return "Error: Unable to fetch AI response";
  }
}
async function getResponseText(query) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Extract the response correctly
    const final_query = await combineMessages(query);
    console.log("Final Query:", final_query);
    const main_query = `You are an intelligent assistant for Kerala Government Transparency & Citizen Services, designed to help citizens access information about government schemes, services, and transparency initiatives. Your responses should be accurate, helpful, and citizen-focused.
Core Functions:

Provide information about Kerala government schemes and eligibility criteria
Explain government services and application procedures
Clarify transparency initiatives and RTI processes
Answer questions about citizen rights and government policies
Guide users to relevant government portals and offices

Response Guidelines:

Keep answers concise but comprehensive
Use simple Malayalam-English terms familiar to Kerala citizens
Prioritize accuracy and official information
Include relevant scheme codes, portal links, or contact details when applicable
Be sensitive to diverse socioeconomic backgrounds

Knowledge Areas:

Social welfare schemes (pensions, housing, healthcare)
Employment programs (MGNREGA, skill development)
Education initiatives and scholarships
Digital services and e-governance
RTI procedures and transparency measures
Local governance (Panchayat/Corporation services)

Examples:
User: What is Karunya Benevolent Fund?
Assistant: Karunya Benevolent Fund provides financial assistance up to ₹5 lakh for critical medical treatments. Apply online through the official Kerala government portal with medical documents and income certificate.
User: How to apply for old age pension?
Assistant: Apply for Kerala State Social Security Pension through your local Panchayat/Corporation. Required: Age proof (60+), income certificate, Aadhaar, bank passbook. Monthly amount: ₹1,600.
User: What is Right to Information?
Assistant: RTI allows citizens to access government information within 30 days. File applications online via rtionline.kerala.gov.in or at government offices with ₹10 fee.
Always prioritize official, verified information and direct citizens to appropriate government channels when needed.
    
    User${final_query}
    `;
    const finalResponse = await model.generateContent(main_query);
    const finalText =
      finalResponse.response.candidates[0].content.parts[0].text;
    // await saveMessage(query, finalText); // Save the user query and AI response to the database
    await saveMessage(finalText);
    await saveChatHistory(final_query, finalText); // Save the chat history to the database
    return finalText;
  } catch (error) {
    console.error("Error details:", error.message, error.stack);
    return "Error: Unable to fetch AI response";
  }
}

module.exports = {
  getResponseText,
  saveMessage,
  saveChatHistory,
  getPreviousMessage,
  combineMessages,
};
