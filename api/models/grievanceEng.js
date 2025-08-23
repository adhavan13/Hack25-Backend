const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
  {
    grievance_title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    project_service_name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    long_description: {
      type: String,
    },
    short_description: {
      type: String,
    },
    grievance_id: {
      type: String,
      unique: true,
      required: true,
    },
    date_of_submission: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    assigned_officer_department: {
      type: String,
    },
    upvotes_count: {
      type: Number,
      default: 0,
    },
    supporting_evidence: {
      type: String, // Can be URL, file path, or base64
    },
  },
  { collection: "grievances_eng" } // 👈 schema option goes here
);

// Create model
const GrievanceEng = mongoose.model("GrievanceEng", grievanceSchema);

module.exports = GrievanceEng;
