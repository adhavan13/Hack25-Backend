const ProjectEng = require("../../models/projectsEng"); // import your mongoose model
const ProjectMal = require("../../models/projectMal"); // import your mongoose model

async function getProjectsName(req, res) {
  try {
    const { sector, pageSize, offset, filters, language, location } = req.body;

    // Build query
    let query = {};
    if (sector) query.sector = sector;
    // if (language) query.language = language;
    // if (filters) Object.assign(query, filters); // merge filters if provided

    // Pagination
    const limit = pageSize ? parseInt(pageSize) : 10;
    const skip = offset ? parseInt(offset) : 0;

    // Projection (only include specific fields, e.g., project_id, name, budget)
    const fieldsToSelect =
      "project_id project_name  scheme_name status budget sector -_id";

    // Fetch from DB
    const projects =
      language === "eng"
        ? await ProjectEng.find(query)
            .select(fieldsToSelect)
            .skip(skip)
            .limit(limit)
        : await ProjectMal.find(query)
            .select(fieldsToSelect)
            .skip(skip)
            .limit(limit);

    res.status(200).json(projects);
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { getProjectsName };
