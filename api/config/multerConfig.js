// // multerConfig.js
// const multer = require("multer");
// const path = require("path");

// // Set up Multer storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // The folder where temporary files will be stored
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
//   },
// });

// const fileFilter = (req, file, cb) => {
//   // Allow only image files
//   const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only JPEG, PNG, JPG are allowed."));
//   }
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload;

// multerConfig.js
const multer = require("multer");
const path = require("path");

// Detect if we're in a serverless environment
const isServerless =
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY;

let storage;

if (isServerless) {
  // Use memory storage for serverless platforms
  console.log("🌐 Using memory storage (serverless)");
  storage = multer.memoryStorage();
} else {
  // Use disk storage for local development
  console.log("💻 Using disk storage (local)");
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, JPG are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = upload;
