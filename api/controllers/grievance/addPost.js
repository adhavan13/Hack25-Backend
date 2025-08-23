// controllers/grievanceController.js

const GrievanceEng = require("../../models/grievanceEng");
const cloudinary = require("../../config/cloudinary");
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
    } = req.body;
    const supporting_evidence = req.file;
    // Upload image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(
      supporting_evidence.path,
      {
        folder: "posts", // Optional: you can specify a folder in Cloudinary
      }
    );
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
      supporting_evidence: uploadedImage.secure_url,
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
