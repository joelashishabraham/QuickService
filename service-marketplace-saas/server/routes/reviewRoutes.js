const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const protect = require("../middleware/authMiddleware");

const multer = require("multer");

/* ================= MULTER SETUP ================= */

/* 🔥 USE MEMORY STORAGE FOR CLOUDINARY */
const storage = multer.memoryStorage();

/* 🔥 FILE FILTER (ALLOW IMAGE TYPES) */
const fileFilter = (req, file, cb) => {

const allowedTypes = [
"image/jpeg",
"image/png",
"image/jpg",
"image/webp"
];

if (allowedTypes.includes(file.mimetype)) {
cb(null, true);
} else {
cb(new Error("Image file format not allowed"), false);
}

};

/* 🔥 LIMIT FILE SIZE (OPTIONAL BUT SAFE) */
const upload = multer({
storage,
fileFilter,
limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/* ================= ADD REVIEW ================= */

router.post(
"/",
protect,
upload.single("image"),
reviewController.addReview
);

/* ================= GET SERVICE REVIEWS ================= */

router.get(
"/service/:serviceId",
reviewController.getServiceReviews
);

/* ================= GET PROVIDER REVIEWS ================= */

router.get(
"/provider/:providerId",
reviewController.getProviderReviews
);

/* ================= ERROR HANDLER (IMPORTANT) ================= */

router.use((err, req, res, next) => {

if (err instanceof multer.MulterError) {
return res.status(400).json({
success:false,
message: err.message
});
}

if (err.message === "Image file format not allowed") {
return res.status(400).json({
success:false,
message: err.message
});
}

next(err);
});

module.exports = router;