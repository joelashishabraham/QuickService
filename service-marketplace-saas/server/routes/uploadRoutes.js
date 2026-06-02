const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

/* STORAGE */

const storage = multer.diskStorage({

destination: function(req,file,cb){
cb(null,"uploads/");
},

filename: function(req,file,cb){
cb(null, Date.now() + path.extname(file.originalname));
}

});

const upload = multer({ storage });

/* UPLOAD ROUTE */

router.post("/", upload.single("file"), (req,res)=>{

res.json({
url: `http://localhost:5000/uploads/${req.file.filename}`
});

});

module.exports = router;