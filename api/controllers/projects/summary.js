const ProjectEng = require("../../models/projectsEng");
const ProjectMal = require("../../models/projectMal");
const { capitalizeFirst } = require("../../utils/captalize");
const { transformProjectSummary } = require("../../utils/transform");

async function getSummary(req, res) {
  try {
    const { language, location } = req.body;

    let query = {};

    // ✅ Dynamically handle any location key (district, state, block, panchayat, etc.)
    if (location && typeof location === "object") {
      for (const [key, value] of Object.entries(location)) {
        if (value) {
          query[`location.${key}`] = capitalizeFirst(value);
        }
      }
    }

    // Select only important fields
    const fieldsToSelect =
      "project_id project_name scheme_name status allocated_budget estimated_cost current_amount_spent sector -_id";

    // Choose collection based on language
    const projects =
      language === "eng"
        ? await ProjectEng.find(query).select(fieldsToSelect)
        : await ProjectMal.find(query).select(fieldsToSelect);
    const results = transformProjectSummary(projects);

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error fetching projects Summary:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { getSummary };
