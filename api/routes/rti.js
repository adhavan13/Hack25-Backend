const express = require("express");

const {
  queryProjectFromNaturalLanguage,
} = require("../controllers/rag/rti.js");
const router = express.Router();

router.post("/getReport", queryProjectFromNaturalLanguage);

module.exports = router;
