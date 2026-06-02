const Service = require("../models/Service");

/* ===================================================
   CREATE SERVICE
=================================================== */

exports.createService = async (req,res)=>{

try{

if(!req.userId){
return res.status(401).json({success:false,message:"Unauthorized"});
}

const {name,description,price,city,category,location,premium} = req.body;

if(!name || !price || !city){
return res.status(400).json({
success:false,
message:"Name, price and city required"
});
}

let images=[];

if(req.files){
images=req.files.map(file=>file.path);
}

const service=await Service.create({

name,
description,
price,
city,

category:category || "General",
images,

provider:req.userId,

location:{
lat:location?.lat || null,
lng:location?.lng || null
},

premium:premium || false,
boosted:false,
boostExpiry:null,

views:0,
rating:0,

reviews:[],
reviewsCount:0,

favorites:[],
favoritesCount:0,

bookings:0,

active:true

});

res.status(201).json({
success:true,
data:service
});

}catch(err){

console.log(err);

res.status(500).json({
success:false,
message:"Service creation failed"
});

}

};


/* ===================================================
   GET SERVICES
=================================================== */

exports.getServices = async (req,res)=>{

try{

let filter={active:true};

/* SELLER PAGE */

if(req.query.seller){
filter.provider=req.query.seller;
}

/* HIDE OWN SERVICES */

else if(req.userId){
filter.provider={$ne:req.userId};
}

/* SEARCH */

if(req.query.search){

filter.$or=[

{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}},
{category:{$regex:req.query.search,$options:"i"}}

];

}

const services=await Service
.find(filter)
.populate("provider","name email phone")
.sort({
boosted:-1,
premium:-1,
rating:-1,
views:-1,
createdAt:-1
});

res.json({
success:true,
count:services.length,
data:services
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   FEATURED SERVICES
=================================================== */

exports.getFeaturedServices = async (req,res)=>{

try{

const services=await Service
.find({premium:true,active:true})
.limit(10)
.populate("provider","name email phone");

res.json({
success:true,
data:services
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   TRENDING SERVICES
=================================================== */

exports.getTrendingServices = async (req,res)=>{

try{

const services=await Service
.find({active:true})
.sort({views:-1,bookings:-1})
.limit(10)
.populate("provider","name email phone");

res.json({
success:true,
data:services
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   TOP RATED SERVICES
=================================================== */

exports.getTopRatedServices = async (req,res)=>{

try{

const services=await Service
.find({active:true})
.sort({rating:-1})
.limit(10)
.populate("provider","name email phone");

res.json({
success:true,
data:services
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   NEARBY SERVICES
=================================================== */

exports.getNearbyServices = async (req,res)=>{

try{

const {lat,lng,radius=50}=req.query;

if(!lat || !lng){
return res.status(400).json({
success:false,
message:"Location required"
});
}

const services=await Service
.find({
active:true,
"location.lat":{$ne:null},
"location.lng":{$ne:null}
})
.populate("provider","name email phone");

const nearby=services.filter(service=>{

const R=6371;

const dLat=(service.location.lat-lat)*Math.PI/180;
const dLon=(service.location.lng-lng)*Math.PI/180;

const a=
Math.sin(dLat/2)**2+
Math.cos(lat*Math.PI/180)*
Math.cos(service.location.lat*Math.PI/180)*
Math.sin(dLon/2)**2;

const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

const distance=R*c;

return distance < radius;

});

res.json({
success:true,
data:nearby
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   SEARCH SUGGESTIONS
=================================================== */

exports.getSearchSuggestions = async (req,res)=>{

try{

const {q}=req.query;

if(!q){
return res.json([]);
}

const services=await Service
.find({
name:{$regex:q,$options:"i"}
})
.limit(5);

const suggestions=services.map(s=>({

text:s.name,
id:s._id

}));

res.json(suggestions);

}catch(err){
res.status(500).json([]);
}

};


/* ===================================================
   MY SERVICES
=================================================== */

exports.getMyServices = async (req,res)=>{

try{

const services=await Service
.find({provider:req.userId})
.sort({createdAt:-1});

res.json({
success:true,
count:services.length,
data:services
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   FAVORITE SERVICE
=================================================== */

exports.toggleFavorite = async (req,res)=>{

try{

const service=await Service.findById(req.params.id);

const exists=service.favorites.includes(req.userId);

if(exists){
service.favorites.pull(req.userId);
}else{
service.favorites.push(req.userId);
}

service.favoritesCount=service.favorites.length;

await service.save();

res.json({
success:true,
favorites:service.favoritesCount
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   GET FAVORITE SERVICES
=================================================== */

exports.getFavoriteServices = async (req,res)=>{

try{

const services=await Service
.find({favorites:req.userId})
.populate("provider","name email");

res.json({
success:true,
data:services
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   ADD REVIEW
=================================================== */

exports.addReview = async (req,res)=>{

try{

const {rating,comment}=req.body;

const service=await Service.findById(req.params.id);

if(service.provider.toString()===req.userId){
return res.status(403).json({
success:false,
message:"Cannot review own service"
});
}

service.reviews.push({
user:req.userId,
rating,
comment
});

service.reviewsCount=service.reviews.length;

service.rating=
service.reviews.reduce((sum,r)=>sum+r.rating,0)
/service.reviews.length;

await service.save();

res.json({
success:true,
rating:service.rating
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   GET REVIEWS
=================================================== */

exports.getReviews = async (req,res)=>{

try{

const service=await Service.findById(req.params.id)
.populate("reviews.user","name");

res.json({
success:true,
data:service.reviews
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   BOOK SERVICE
=================================================== */

exports.bookService = async (req,res)=>{

try{

const service=await Service.findById(req.params.id);

if(service.provider.toString()===req.userId){
return res.status(403).json({
success:false,
message:"Cannot book your own service"
});
}

service.bookings+=1;

await service.save();

res.json({
success:true,
message:"Booking successful"
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   BOOST SERVICE (ADS)
=================================================== */

exports.boostService = async (req,res)=>{

try{

const service=await Service.findById(req.params.id);

if(service.provider.toString()!==req.userId){
return res.status(403).json({success:false});
}

service.boosted=true;
service.boostExpiry=Date.now()+(7*24*60*60*1000);

await service.save();

res.json({
success:true,
message:"Service boosted"
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   ANALYTICS
=================================================== */

exports.getServiceAnalytics = async (req,res)=>{

try{

const services=await Service.find({provider:req.userId});

const totalViews=services.reduce((sum,s)=>sum+(s.views||0),0);
const totalBookings=services.reduce((sum,s)=>sum+(s.bookings||0),0);
const totalFavorites=services.reduce((sum,s)=>sum+(s.favoritesCount||0),0);

res.json({
success:true,
analytics:{
totalServices:services.length,
totalViews,
totalBookings,
totalFavorites
}
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   AI DESCRIPTION
=================================================== */

exports.generateDescription = async (req,res)=>{

try{

const {category,city}=req.body;

const description=`
Professional ${category} services available in ${city || "your area"}.

✔ Experienced technicians
✔ Affordable pricing
✔ Fast response

Book trusted ${category} services today.
`;

res.json({
success:true,
description
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   GET SINGLE SERVICE
=================================================== */

exports.getServiceById = async (req,res)=>{

try{

const service=await Service
.findById(req.params.id)
.populate("provider","name email phone");

if(!service){
return res.status(404).json({success:false});
}

service.views+=1;

await service.save();

res.json({
success:true,
data:service
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   UPDATE SERVICE
=================================================== */

exports.updateService = async (req,res)=>{

try{

const service=await Service.findById(req.params.id);

if(service.provider.toString()!==req.userId){
return res.status(403).json({success:false});
}

Object.assign(service,req.body);

await service.save();

res.json({
success:true,
data:service
});

}catch(err){
res.status(500).json({success:false});
}

};


/* ===================================================
   DELETE SERVICE
=================================================== */

exports.deleteService = async (req,res)=>{
try{

const service = await Service.findById(req.params.id);

if(!service){
return res.status(404).json({
success:false,
message:"Service not found"
});
}

/* 🔥 OWNER OR ADMIN CHECK */
if(
service.provider.toString() !== req.userId.toString() &&
req.userRole !== "admin"
){
return res.status(403).json({
success:false,
message:"Not allowed to delete"
});
}

/* DELETE */
await service.deleteOne();

res.json({
success:true,
message:"Service deleted successfully"
});

}catch(err){

console.log("DELETE ERROR:",err);

res.status(500).json({
success:false,
message:"Server error"
});
}
};