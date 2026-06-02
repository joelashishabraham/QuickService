const User = require("../models/User");
const Service = require("../models/Service");


/* ================= GET ALL PROVIDERS ================= */

exports.getAllProviders = async (req,res)=>{

try{

const providers = await User
.find({ role:"provider" })
.select("-password")
.sort({ createdAt:-1 });

res.json({
success:true,
count:providers.length,
providers
});

}catch(error){

console.error("GET PROVIDERS ERROR:",error);

res.status(500).json({
success:false,
message:"Server error"
});

}

};



/* ================= GET SINGLE PROVIDER ================= */

exports.getProviderById = async (req,res)=>{

try{

const provider = await User
.findById(req.params.id)
.select("-password");

if(!provider){

return res.status(404).json({
success:false,
message:"Provider not found"
});

}

/* GET PROVIDER SERVICES */

const services = await Service
.find({ provider:req.params.id, active:true })
.sort({ createdAt:-1 })
.limit(12);

res.json({
success:true,
provider,
services
});

}catch(error){

console.error("GET PROVIDER ERROR:",error);

res.status(500).json({
success:false,
message:"Server error"
});

}

};



/* ================= GET MY PROFILE ================= */

exports.getMyProfile = async (req,res)=>{

try{

const provider = await User
.findById(req.user.id)
.select("-password");

res.json({
success:true,
provider
});

}catch(error){

console.error("GET PROFILE ERROR:",error);

res.status(500).json({
success:false,
message:"Server error"
});

}

};



/* ================= UPDATE PROFILE ================= */

exports.updateProfile = async (req,res)=>{

try{

const updated = await User.findByIdAndUpdate(

req.user.id,
req.body,
{ new:true }

).select("-password");

res.json({
success:true,
provider:updated
});

}catch(error){

console.error("UPDATE PROFILE ERROR:",error);

res.status(500).json({
success:false,
message:"Server error"
});

}

};



/* ================= GET MY SERVICES ================= */

exports.getMyServices = async (req,res)=>{

try{

const services = await Service
.find({ provider:req.user.id })
.sort({ createdAt:-1 });

res.json({
success:true,
count:services.length,
services
});

}catch(error){

console.error("GET MY SERVICES ERROR:",error);

res.status(500).json({
success:false,
message:"Server error"
});

}

};



/* ================= PROVIDER DASHBOARD ================= */

exports.getDashboardStats = async (req,res)=>{

try{

const services = await Service.find({ provider:req.user.id });

const totalServices = services.length;

const totalViews = services.reduce(
(sum,s)=>sum + (s.views || 0),0
);

const totalBookings = services.reduce(
(sum,s)=>sum + (s.bookings || 0),0
);

const avgRating =
services.length > 0
? services.reduce((sum,s)=>sum + (s.rating || 0),0) / services.length
:0;

res.json({
success:true,
stats:{
totalServices,
totalViews,
totalBookings,
avgRating
}
});

}catch(error){

console.error("DASHBOARD ERROR:",error);

res.status(500).json({
success:false,
message:"Server error"
});

}

};