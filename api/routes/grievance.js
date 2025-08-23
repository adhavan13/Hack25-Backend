const express = require("express");

const { getPosts } = require("../controllers/grievance/getPosts.js");
const router = express.Router();

router.post("/getPosts", getPosts);

module.exports = router;
