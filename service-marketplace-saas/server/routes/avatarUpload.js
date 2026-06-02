const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
    });

    res.json({
      url: result.secure_url
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;