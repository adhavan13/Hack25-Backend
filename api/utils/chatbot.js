const GoogleGenerativeAI = require("@google/generative-ai");
const dotenv = require("dotenv");
const priviousMessageSchema = require("../models/chatbotHistory");
const ChathistorySchema = require("../models/chatbot");
dotenv.config();

// Initialize Gemini Model
const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(
  "AIzaSyA_7aHUr4SysEZjE6Ee3Nv6Pmsc_y_PT5Q"
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
    const main_query = `Kerala Government Transparency & Citizen Services Assistant
This assistant is designed to help users access information about Kerala's government schemes, services, and transparency initiatives. It provides quick and accurate responses related to various government programs, eligibility, application procedures, and citizen rights.

Core Functions:

Provide details on government schemes, eligibility, and applications.

Explain services and procedures.

Guide on transparency measures and RTI.

Clarify citizen rights and government policies.

Offer links to relevant portals and offices.

Response Guidelines:

Short & Helpful: Responses should be brief, clear, and to the point to ensure ease of understanding.

Simple Terms: Use simple Malayalam-English terms familiar to citizens of Kerala.

Accurate Information: Prioritize verified, official information in all responses.

Links & Contacts: When applicable, include links to official portals or contact details.

Supportive: Provide step-by-step guidance for complex processes.

Knowledge Areas:

Social Welfare: Pensions, housing, healthcare schemes.

Employment: MGNREGA, skill development programs.

Education: Scholarships, education initiatives.

Digital Services: E-governance and digital platforms.

RTI: Procedures for Right to Information.

Local Governance: Panchayat and Corporation services.

Example Queries:

User: What is the Karunya Benevolent Fund?
Assistant: The Karunya Benevolent Fund offers financial assistance up to ₹5 lakh for critical medical treatments. Apply online via the Kerala government portal with medical documents and an income certificate.

User: How to apply for old age pension?
Assistant: Apply at your local Panchayat or Corporation with age proof (60+), income certificate, Aadhaar, and bank passbook. Monthly pension: ₹1,600.

User: What is RTI?
Assistant: RTI (Right to Information) allows citizens to request government information within 30 days. Apply online via rtionline.kerala.gov.in or at local government offices with a ₹10 fee.
    
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
