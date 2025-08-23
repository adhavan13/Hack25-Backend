const express = require("express");

const {
  getProjectsName,
} = require("../controllers/projects/getProjectsName.js");
const {
  getProjectDetails,
} = require("../controllers/projects/getProjectDetails.js");
const { getSummary } = require("../controllers/projects/summary.js");
const router = express.Router();

router.post("/getNames", getProjectsName);
router.post("/getDetails", getProjectDetails);
router.post("/getSummary", getSummary);

module.exports = router;
