const cloudinary = require("cloudinary").v2;

// Cloudinary configuration
function cloud() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });
}

module.exports = cloud;
