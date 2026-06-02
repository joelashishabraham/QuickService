const express = require("express");
const router = express.Router();

/* ================= MIDDLEWARE ================= */

const auth = require("../middleware/authMiddleware");
const authOptional = require("../middleware/authOptional");
const upload = require("../middleware/upload");

/* ================= MODEL ================= */

const Service = require("../models/Service"); // 🔥 FIX (was missing)

/* ================= CONTROLLER ================= */

const serviceController = require("../controllers/serviceController");

/* ================= SAFE WRAPPER ================= */

const safe = (fn)=>{
return async (req,res,next)=>{
try{

if(typeof fn !== "function"){
return res.status(500).json({
success:false,
message:"Controller function not implemented"
});
}

await fn(req,res,next);

}catch(error){

console.error("Service route error:",error);

res.status(500).json({
success:false,
message:"Server error"
});

}
};
};

/* =========================================
   CREATE SERVICE
========================================= */

router.post(
"/",
auth,
upload.array("images",5),
safe(serviceController.createService)
);

/* =========================================
   SIMPLE CREATE (LEGACY)
========================================= */

router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { title, description, price } = req.body;

    const newService = new Service({
      title,
      description,
      price,
      images: req.file ? [req.file.path] : [],
    });

    await newService.save();

    res.json({ success: true, service: newService });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================
   GET ALL SERVICES
========================================= */

router.get("/", authOptional, safe(serviceController.getServices));

router.get("/featured", authOptional, safe(serviceController.getFeaturedServices));
router.get("/trending", authOptional, safe(serviceController.getTrendingServices));
router.get("/top-rated", authOptional, safe(serviceController.getTopRatedServices));
router.get("/nearby", authOptional, safe(serviceController.getNearbyServices));
router.get("/search", authOptional, safe(serviceController.searchServices));
router.get("/suggest", authOptional, safe(serviceController.getSearchSuggestions));

/* =========================================
   USER SERVICES
========================================= */

router.get("/my", auth, safe(serviceController.getMyServices));

/* =========================================
   FAVORITES
========================================= */

router.post("/favorite/:id", auth, safe(serviceController.toggleFavorite));
router.get("/favorites", auth, safe(serviceController.getFavoriteServices));

/* =========================================
   REVIEWS
========================================= */

router.post("/review/:id", auth, safe(serviceController.addReview));
router.get("/reviews/:id", authOptional, safe(serviceController.getReviews));

/* =========================================
   BOOKINGS
========================================= */

router.post("/book/:id", auth, safe(serviceController.bookService));

/* =========================================
   BOOST / ADS
========================================= */

router.post("/boost/:id", auth, safe(serviceController.boostService));

router.put("/:id/promote", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.json({ success: false });
    }

    service.isAd = true;
    await service.save();

    res.json({ success: true });

  } catch (err) {
    res.json({ success: false });
  }
});

/* =========================================
   ANALYTICS
========================================= */

router.get("/analytics", auth, safe(serviceController.getServiceAnalytics));

/* =========================================
   AI DESCRIPTION
========================================= */

router.post("/ai-description", auth, safe(serviceController.generateDescription));

/* =========================================
   UPDATE SERVICE (🔥 FIXED)
========================================= */

router.put("/:id", auth, upload.array("images",5), async (req,res)=>{

try{

const service = await Service.findById(req.params.id);

if(!service){
return res.status(404).json({ success:false, message:"Service not found" });
}

// 🔥 OWNER OR ADMIN CHECK
if(
service.provider.toString() !== req.userId.toString() &&
req.userRole !== "admin"
){
return res.status(403).json({ success:false, message:"Not allowed" });
}

// ================= IMAGE UPDATE =================

const existing = req.body.existingImages || [];
const existingImages = Array.isArray(existing) ? existing : [existing];

const newImages = req.files && req.files.length > 0
  ? req.files.map(file => file.path)
  : [];

service.images = [...existingImages, ...newImages];

// ================= FIELD UPDATE =================

service.name = req.body.name ?? service.name;
service.price = req.body.price ?? service.price;
service.city = req.body.city ?? service.city;
service.description = req.body.description ?? service.description;
service.category = req.body.category ?? service.category;
service.phone = req.body.phone ?? service.phone;

if (req.body.premium !== undefined) {
  service.premium = req.body.premium === "true" || req.body.premium === true;
}

await service.save();

res.json({
success:true,
message:"Service updated",
data:service
});

}catch(err){
console.log("UPDATE ERROR:", err);
res.status(500).json({
success:false,
message:"Server error"
});
}

});

/* =========================================
   DELETE SERVICE
========================================= */

router.delete("/:id", auth, safe(serviceController.deleteService));router.delete("/:id", auth, safe(serviceController.deleteService));
/* =========================================
   GET SINGLE SERVICE
========================================= */

router.get("/:id", authOptional, safe(serviceController.getServiceById));

module.exports = router;