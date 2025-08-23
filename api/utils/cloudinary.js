
const multer = require("multer");
const multerStorageCloudinary = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig"); // Import the Cloudinary config
const Post = require("./models/Post"); // Your Post model for MongoDB

const app = express();

// Cloudinary storage configuration
const storage = multerStorageCloudinary({
  cloudinary: cloudinary,
  folder: "posts", // The folder where your images will be stored
  allowedFormats: ["jpg", "png", "jpeg", "gif"], // Allowed image formats
});

const upload = multer({ storage }); // Multer instance for handling image uploads

// Post route (handling image upload and post creation)
app.post("/api/posts", upload.single("image"), async (req, res) => {
  try {
    const { caption } = req.body;
    const imageUrl = req.file?.secure_url; // Get the Cloudinary image URL

    // Create a new post with the image URL and caption
    const newPost = new Post({
      caption,
      image: imageUrl, // Store the Cloudinary image URL in MongoDB
    });

    await newPost.save();
    res.status(201).json(newPost); // Return the created post
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).send("Error saving post");
  }
});

// Fetch all posts route
x

// Start the server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
