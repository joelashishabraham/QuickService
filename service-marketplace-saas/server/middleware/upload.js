const multer = require("multer");
const path = require("path");

/* ================= STORAGE ================= */

const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, "uploads/services"); // change if needed
},
filename: (req, file, cb) => {
cb(null, Date.now() + path.extname(file.originalname));
}
});

/* ================= FILE FILTER ================= */

const fileFilter = (req, file, cb) => {

const allowedTypes = [
"image/jpeg",
"image/png",
"image/jpg",
"image/webp"   // ✅ FIX YOUR ERROR
];

if (allowedTypes.includes(file.mimetype)) {
cb(null, true);
} else {
cb(new Error("Image file format not allowed"), false);
}

};

/* ================= MULTER ================= */

const upload = multer({
storage,
fileFilter,
limits:{
fileSize: 5 * 1024 * 1024 // 5MB limit (optional 🔥)
}
});

module.exports = upload;