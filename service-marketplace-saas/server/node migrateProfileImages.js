const mongoose = require("mongoose");
const cloudinary = require("./config/cloudinary");
const User = require("./models/User");
require("dotenv").config();
const path = require("path");
const fs = require("fs");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log(err));

const migrateProfileImages = async () => {
  try {
    const users = await User.find();

    for (let user of users) {

      if (!user.image) {
        console.log(`⚠️ No image: ${user.name}`);
        continue;
      }

      // Skip if already Cloudinary
      if (user.image.startsWith("http")) {
        console.log(`⏭️ Already migrated: ${user.name}`);
        continue;
      }

      const localPath = path.join(__dirname, user.image);

      if (!fs.existsSync(localPath)) {
        console.log(`❌ File not found: ${localPath}`);
        continue;
      }

      try {
        const result = await cloudinary.uploader.upload(localPath, {
          folder: "profiles",
        });

        user.image = result.secure_url;
        await user.save();

        console.log(`✅ Profile migrated: ${user.name}`);

      } catch (err) {
        console.log(`❌ Upload failed: ${user.name}`, err.message);
      }
    }

    console.log("🎉 Profile migration complete");
    process.exit();

  } catch (err) {
    console.log(err);
  }
};

migrateProfileImages();