const mongoose = require("mongoose");
const cloudinary = require("./config/cloudinary");
const Service = require("./models/Service");
require("dotenv").config();
const path = require("path");
const fs = require("fs");

// 🔌 Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB Error:", err));

const migrateImages = async () => {
  try {
    const services = await Service.find();

    console.log(`📦 Total services: ${services.length}`);

    for (let service of services) {

      let imageList = [];

      // 🔥 HANDLE BOTH CASES
      if (service.images && service.images.length > 0) {
        imageList = service.images;
      } else if (service.image) {
        imageList = [service.image];
      } else {
        console.log(`⚠️ No images: ${service.name}`);
        continue;
      }

      let newImages = [];

      for (let img of imageList) {

        if (!img) continue;

        // ✅ Already Cloudinary
        if (img.startsWith("http")) {
          newImages.push(img);
          continue;
        }

        // 🔥 FIX WINDOWS PATH
        const fixedPath = img.replace(/\\/g, "/");

        // 🔥 Correct absolute path
        const localPath = path.join(__dirname, fixedPath);

        // ❌ File not found
        if (!fs.existsSync(localPath)) {
          console.log(`❌ File not found: ${localPath}`);
          continue;
        }

        try {
          const result = await cloudinary.uploader.upload(localPath, {
            folder: "services",
          });

          newImages.push(result.secure_url);

          console.log(`✅ Uploaded: ${service.name}`);

        } catch (err) {
          console.log(`❌ Upload failed: ${service.name}`, err.message);
        }
      }

      // ✅ SAVE UPDATED IMAGES
      if (newImages.length > 0) {
        service.images = newImages;
        service.image = undefined; // 🔥 cleanup old field
        await service.save();
      } else {
        console.log(`⚠️ No valid uploads for: ${service.name}`);
      }
    }

    console.log("🎉 Migration complete");
    process.exit();

  } catch (err) {
    console.log("❌ Migration error:", err);
  }
};

migrateImages();