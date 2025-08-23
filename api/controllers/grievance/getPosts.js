const GrievanceEng = require("../../models/grievanceEng"); // import your mongoose model

async function getPosts(req, res) {
  try {
    const { sector, pageSize, offset, filters, language } = req.body;
    // Build query
    let query = {};
    if (sector && sector !== null) query.sector = sector;
    // if (language) query.language = language;
    // if (filters) Object.assign(query, filters); // merge filters if provided

    // Pagination
    const limit = pageSize ? parseInt(pageSize) : 10;
    const skip = offset ? parseInt(offset) : 0;

    // Fetch from DB
    const grievances =
      language === "eng"
        ? await GrievanceEng.find(query).skip(skip).limit(limit)
        : await GrievanceMal.find(query).skip(skip).limit(limit);

    res.status(200).json(grievances);
  } catch (error) {
    console.error("❌ Error fetching grievances:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { getPosts };
