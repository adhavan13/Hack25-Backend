const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db.js");
const app = express();
const PORT = process.env.PORT || 3001;
connectDB();

const projectsRoutes = require("./routes/projects.js");

// Security middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/projects", projectsRoutes);

// Export for Vercel (serverless mode)
module.exports = app;
// module.exports.handler = serverless(app);

// Run locally
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}
