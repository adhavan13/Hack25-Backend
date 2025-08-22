const express = require("express");

const { getProjects } = require("../controllers/projects/getProjectsName.js");
const router = express.Router();

router.post("/get", getProjects);

module.exports = router;
