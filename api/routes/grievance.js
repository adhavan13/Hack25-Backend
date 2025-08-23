const express = require("express");

const { getPosts } = require("../controllers/grievance/getPosts.js");
const { addPost } = require("../controllers/grievance/addPost.js");
const router = express.Router();
// routes/postRoutes.js

const upload = require("../config/multerConfig.js"); // Import Multer config

module.exports = router;

router.post("/getPosts", getPosts);
router.post("/addPost", upload.single("image"), addPost);

module.exports = router;
