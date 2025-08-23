// controllers/grievanceController.js

const GrievanceEng = require("../../models/grievanceEng");
// Add a new grievance
async function addPost(req, res) {
  try {
    const {
      grievance_title,
      category,
      project_service_name,
      location,
      long_description,
      short_description,
      grievance_id,
      date_of_submission,
      status,
      assigned_officer_department,
      upvotes_count,
      supporting_evidence,
    } = req.body;

    // Create a new grievance document
    const newGrievance = new GrievanceEng({
      grievance_title,
      category,
      project_service_name,
      location,
      long_description,
      short_description,
      grievance_id,
      date_of_submission,
      status,
      assigned_officer_department,
      upvotes_count,
      supporting_evidence,
    });

    // Save to DB
    const savedGrievance = await newGrievance.save();

    res.status(201).json({
      success: true,
      message: "Grievance added successfully",
      data: savedGrievance,
    });
  } catch (error) {
    console.error("Error adding grievance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add grievance",
      error: error.message,
    });
  }
}

module.exports = { addPost };
