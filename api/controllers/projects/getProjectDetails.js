const ProjectEng = require("../../models/projectsEng"); // import your mongoose model
const ProjectMal = require("../../models/projectMal"); // import your mongoose model

async function getProjectDetails(req, res) {
  try {
    const { projectId, filters, language, location } = req.body;
    // Build query
    let query = {};
    query.project_id = projectId;

    // if (language) query.language = language;
    // if (filters) Object.assign(query, filters); // merge filters if provid

    // Projection (only include specific fields, e.g., project_id, name, budget)

    // Fetch from DB
    const projects =
      language === "eng"
        ? await ProjectEng.find(query)
        : await ProjectMal.find(query);

    res.status(200).json(projects);
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { getProjectDetails };
