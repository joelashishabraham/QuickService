const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const cloudinary = require("../config/cloudinary");

/* ================= ADD REVIEW ================= */

exports.addReview = async (req,res)=>{
try{

const { bookingId, rating, comment } = req.body;

/* ================= VALIDATION ================= */

if(!bookingId || !rating){
return res.status(400).json({
success:false,
message:"Booking and rating required"
});
}

const numericRating = Number(rating);

if(isNaN(numericRating) || numericRating < 1 || numericRating > 5){
return res.status(400).json({
success:false,
message:"Rating must be between 1 and 5"
});
}

/* ================= FIND BOOKING ================= */

const booking = await Booking.findById(bookingId);

if(!booking){
return res.status(404).json({
success:false,
message:"Booking not found"
});
}

/* ================= ONLY CUSTOMER ================= */

if(String(booking.customer) !== String(req.userId)){
return res.status(403).json({
success:false,
message:"Not allowed"
});
}

/* ================= ONLY COMPLETED ================= */

if(booking.status !== "completed"){
return res.status(400).json({
success:false,
message:"Service not completed yet"
});
}

/* ================= PREVENT DUPLICATE ================= */

const existingReview = await Review.findOne({ booking: bookingId });

if(existingReview){
return res.status(400).json({
success:false,
message:"Review already submitted"
});
}

/* ================= IMAGE (CLOUDINARY SAFE) ================= */

let image = null;

if(req.file){

try{

// ✅ CASE 1: MEMORY STORAGE (buffer)
if(req.file.buffer){

const uploadResult = await new Promise((resolve, reject) => {

const stream = cloudinary.uploader.upload_stream(
{
folder: "reviews"
},
(error, result) => {
if(error) return reject(error);
resolve(result);
}
);

stream.end(req.file.buffer);

});

image = uploadResult.secure_url;

}

// ✅ CASE 2: DISK STORAGE (path)
else if(req.file.path){

const uploadResult = await cloudinary.uploader.upload(req.file.path, {
folder: "reviews"
});

image = uploadResult.secure_url;

}

}catch(uploadErr){

console.log("🔥 CLOUDINARY ERROR:", uploadErr.message);

// don't break review if image fails
image = null;

}
}

/* ================= CREATE REVIEW ================= */

const newReview = await Review.create({
service: booking.service,
booking: booking._id,
customer: req.userId,
provider: booking.provider,
rating: numericRating,
comment: comment || "",
image
});

/* ================= UPDATE BOOKING ================= */

booking.review = newReview._id;
await booking.save();

/* ================= UPDATE SERVICE RATING ================= */

const stats = await Review.aggregate([
{ $match:{ service: booking.service } },
{
$group:{
_id:"$service",
avgRating:{ $avg:"$rating" },
count:{ $sum:1 }
}
}
]);

if(stats.length > 0){

await Service.findByIdAndUpdate(
booking.service,
{
rating: Number(stats[0].avgRating.toFixed(1)),
reviewCount: stats[0].count
}
);

}

/* ================= RESPONSE ================= */

res.json({
success:true,
message:"Review submitted",
data:newReview
});

}catch(err){

console.log("❌ ADD REVIEW ERROR FULL:", err); // 🔥 FULL ERROR

res.status(500).json({
success:false,
message: err.message || "Server error"
});

}
};

/* ================= GET SERVICE REVIEWS ================= */

exports.getServiceReviews = async(req,res)=>{
try{

const { serviceId } = req.params;

if(!serviceId){
return res.status(400).json({
success:false,
message:"Service ID required"
});
}

const reviews = await Review
.find({
service: serviceId,
status:"visible"
})
.populate("customer","name avatar")
.sort({ createdAt:-1 });

res.json({
success:true,
count:reviews.length,
data:reviews
});

}catch(err){

console.log("❌ GET SERVICE REVIEWS ERROR:",err);

res.status(500).json({
success:false,
message: err.message || "Server error"
});
}
};

/* ================= GET PROVIDER REVIEWS ================= */

exports.getProviderReviews = async(req,res)=>{
try{

const { providerId } = req.params;

if(!providerId){
return res.status(400).json({
success:false,
message:"Provider ID required"
});
}

const reviews = await Review
.find({
provider: providerId,
status:"visible"
})
.populate("customer","name avatar")
.populate("service","name")
.sort({ createdAt:-1 });

res.json({
success:true,
count:reviews.length,
data:reviews
});

}catch(err){

console.log("❌ GET PROVIDER REVIEWS ERROR:",err);

res.status(500).json({
success:false,
message: err.message || "Server error"
});
}
};