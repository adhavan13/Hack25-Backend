const express = require("express");

const { getPosts } = require("../controllers/grievance/getPosts.js");
const { addPost } = require("../controllers/grievance/addPost.js");
const router = express.Router();

router.post("/getPosts", getPosts);
router.post("/addPost", addPost);

module.exports = router;
