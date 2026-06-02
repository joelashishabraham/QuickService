const User = require("../models/User");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Report = require("../models/Report");
const Feature = require("../models/Feature");


/* =======================================================
   ADMIN DASHBOARD STATS
======================================================= */

exports.getAdminStats = async (req,res)=>{

try{

const users = await User.countDocuments();
const services = await Service.countDocuments();
const bookings = await Booking.countDocuments();
const reports = await Report.countDocuments();

res.json({
success:true,
stats:{users,services,bookings,reports}
});

}catch(error){

console.error("Admin stats error:",error);

res.status(500).json({
success:false,
message:"Failed to load admin stats"
});

}

};



/* =======================================================
   USER MANAGEMENT
======================================================= */

exports.getAllUsers = async (req,res)=>{

try{

const users = await User.find().select("-password");

res.json({
success:true,
users
});

}catch(error){

console.error("Get users error:",error);

res.status(500).json({
success:false,
message:"Failed to fetch users"
});

}

};



exports.deleteUser = async (req,res)=>{

try{

const user = await User.findById(req.params.id);

if(!user){

return res.status(404).json({
success:false,
message:"User not found"
});

}

await User.findByIdAndDelete(req.params.id);

res.json({
success:true,
message:"User deleted"
});

}catch(error){

console.error("Delete user error:",error);

res.status(500).json({success:false});

}

};



exports.toggleBlockUser = async (req,res)=>{

try{

const user = await User.findById(req.params.id);

if(!user){

return res.status(404).json({
success:false,
message:"User not found"
});

}

user.blocked = !user.blocked;

await user.save();

res.json({
success:true,
blocked:user.blocked
});

}catch(error){

console.error("Block user error:",error);

res.status(500).json({success:false});

}

};



/* =======================================================
   SERVICES / ADS CONTROL
======================================================= */

exports.getAllServices = async (req,res)=>{

try{

const services = await Service
.find()
.populate("provider","name email")
.sort({createdAt:-1});

res.json({
success:true,
services
});

}catch(error){

console.error("Services error:",error);

res.status(500).json({
success:false,
message:"Failed to fetch services"
});

}

};



exports.deleteService = async (req,res)=>{

try{

await Service.findByIdAndDelete(req.params.id);

res.json({
success:true,
message:"Service deleted"
});

}catch(error){

console.error("Delete service error:",error);

res.status(500).json({success:false});

}

};



/* ================= PREMIUM ADS ================= */

exports.togglePremiumService = async (req,res)=>{

try{

const service = await Service.findById(req.params.id);

if(!service){

return res.status(404).json({
success:false,
message:"Service not found"
});

}

service.premium = !service.premium;

await service.save();

res.json({
success:true,
premium:service.premium
});

}catch(error){

console.error("Premium service error:",error);

res.status(500).json({success:false});

}

};



/* ================= BOOST ADS ================= */

exports.toggleBoostService = async (req,res)=>{

try{

const service = await Service.findById(req.params.id);

service.boosted = !service.boosted;

await service.save();

res.json({
success:true,
boosted:service.boosted
});

}catch(error){

console.error("Boost service error:",error);

res.status(500).json({success:false});

}

};



/* =======================================================
   BOOKINGS
======================================================= */

exports.getAllBookings = async (req,res)=>{

try{

const bookings = await Booking
.find()
.populate("customer","name email")
.populate("provider","name email")
.populate("service","name price")
.sort({createdAt:-1});

res.json({
success:true,
bookings
});

}catch(error){

console.error("Booking admin error:",error);

res.status(500).json({
success:false,
message:"Failed to fetch bookings"
});

}

};



/* =======================================================
   REPORT MANAGEMENT
======================================================= */

exports.getAllReports = async (req,res)=>{

try{

const reports = await Report
.find()
.populate("user","name email");

res.json({
success:true,
reports
});

}catch(error){

console.error("Reports error:",error);

res.status(500).json({success:false});

}

};



exports.resolveReport = async (req,res)=>{

try{

const report = await Report.findById(req.params.id);

if(!report){

return res.status(404).json({
success:false,
message:"Report not found"
});

}

report.status = "resolved";

await report.save();

res.json({
success:true,
message:"Report resolved"
});

}catch(error){

console.error("Resolve report error:",error);

res.status(500).json({success:false});

}

};



exports.deleteReport = async (req,res)=>{

try{

await Report.findByIdAndDelete(req.params.id);

res.json({
success:true,
message:"Report deleted"
});

}catch(error){

console.error("Delete report error:",error);

res.status(500).json({success:false});

}

};



/* =======================================================
   FEATURE MANAGEMENT
======================================================= */

exports.getFeatures = async (req,res)=>{

try{

const features = await Feature.find();

res.json({
success:true,
features
});

}catch(error){

console.error("Get features error:",error);

res.status(500).json({success:false});

}

};



exports.addFeature = async (req,res)=>{

try{

const feature = new Feature({
title:req.body.title,
description:req.body.description,
active:true
});

await feature.save();

res.json({
success:true,
message:"Feature added"
});

}catch(error){

console.error("Add feature error:",error);

res.status(500).json({success:false});

}

};



exports.deleteFeature = async (req,res)=>{

try{

await Feature.findByIdAndDelete(req.params.id);

res.json({
success:true,
message:"Feature deleted"
});

}catch(error){

console.error("Delete feature error:",error);

res.status(500).json({success:false});

}

};



exports.toggleFeature = async (req,res)=>{

try{

const feature = await Feature.findById(req.params.id);

if(!feature){

return res.status(404).json({
success:false,
message:"Feature not found"
});

}

feature.active = !feature.active;

await feature.save();

res.json({
success:true,
active:feature.active
});

}catch(error){

console.error("Toggle feature error:",error);

res.status(500).json({success:false});

}

};