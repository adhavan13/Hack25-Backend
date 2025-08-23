const ProjectEng = require("../../models/projectsEng");
const {
  getMongoQueryFromGemini,
  getProjectData,
} = require("../../utils/generateDynamicQuery");
const { generateRTIReport } = require("../../utils/transformToRtiReport");
require("dotenv").config();

const API_KEY = process.env.LLM_KEY;
async function queryProjectFromNaturalLanguage(req, res) {
  try {
    const { userQuery } = req.body;
    console.log("User Query:", userQuery);

    // Step 1: Generate MongoDB query using Gemini
    const mongoQuery = await getMongoQueryFromGemini(userQuery, API_KEY);
    console.log(
      "Generated MongoDB Query:",
      JSON.stringify(mongoQuery, null, 2)
    );
    // Step 2: Execute query against database
    const projectData = await getProjectData(mongoQuery, ProjectEng);
    console.log("Found Project:", projectData.project_name);
    // Step 3: Generate RTI report
    const rtiReport = await generateRTIReport(projectData, userQuery, API_KEY);
    console.log("RTI report generated successfully");

    // const pdf = convertRTIReportToPDF_jsPDF(rtiReport);

    return res.status(200).json({ rtiReport });
  } catch (error) {
    console.error("Error in complete workflow:", error);
    throw error;
  }
}

module.exports = { queryProjectFromNaturalLanguage };
