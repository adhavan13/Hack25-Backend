const GrievanceEng = require("../../models/grievanceEng");
const cloudinary = require("../../config/cloudinary");
const fs = require("fs");

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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Supporting evidence file is required",
      });
    }

    console.log("✅ File received:", req.file.filename);

    // Upload image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
      folder: "posts",
    });

    console.log("☁️ Cloudinary upload successful:", uploadedImage.secure_url);

    // Clean up temporary file after successful upload
    fs.unlinkSync(req.file.path);

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
      supporting_evidence: uploadedImage.secure_url, // Use Cloudinary URL
    });

    const savedGrievance = await newGrievance.save();

    res.status(201).json({
      success: true,
      message: "Grievance added successfully",
      data: savedGrievance,
    });
  } catch (error) {
    // Clean up temporary file if anything fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Error adding grievance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add grievance",
      error: error.message,
    });
  }
}

module.exports = { addPost };
    