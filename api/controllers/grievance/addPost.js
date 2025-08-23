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

    console.log("✅ File received:", req.file.originalname);

    let uploadedImage;

    // Handle different storage types
    if (req.file.buffer) {
      // Memory storage (Vercel/serverless)
      console.log("📤 Uploading from memory buffer");
      uploadedImage = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString(
          "base64"
        )}`,
        {
          folder: "posts",
          resource_type: "image",
        }
      );
    } else if (req.file.path) {
      // Disk storage (local development)
      console.log("📤 Uploading from file path");
      uploadedImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "posts",
      });

      // Clean up local file after upload
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } else {
      throw new Error("No file data available");
    }

    console.log("☁️ Cloudinary upload successful:", uploadedImage.secure_url);

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

    const savedGrievance = await newGrievance.save();

    res.status(201).json({
      success: true,
      message: "Grievance added successfully",
      data: savedGrievance,
    });
  } catch (error) {
    // Clean up local file if it exists and upload failed
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
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
