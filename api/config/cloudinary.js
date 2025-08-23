// cloudinaryConfig.js
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: "Untitled", // Replace with your Cloudinary cloud name
  api_key: "988695815119312", // Replace with your Cloudinary API key
  api_secret: "iw2ODbFonyWgVSQoYn9iIMdDfrk", // Replace with your Cloudinary API secret
});

module.exports = cloudinary;
