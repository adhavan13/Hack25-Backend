// cloudinaryConfig.js
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: "dqeyy2r5t", // Replace with your Cloudinary cloud name
  api_key: "948629372195348", // Replace with your Cloudinary API key
  api_secret: "iw2ODbFonyWgVSQoYn9iIMdDfrk", // Replace with your Cloudinary API secret
});

module.exports = cloudinary;
