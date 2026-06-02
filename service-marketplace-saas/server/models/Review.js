const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({

service:{
type:mongoose.Schema.Types.ObjectId,
ref:"Service",
required:true
},

booking:{
type:mongoose.Schema.Types.ObjectId,
ref:"Booking",
required:true,
unique:true
},

customer:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

provider:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

rating:{
type:Number,
required:true,
min:1,
max:5
},

comment:{
type:String,
trim:true
},

image:{
type:String,
default:null
},

status:{
type:String,
default:"visible"
}

},{timestamps:true});

module.exports = mongoose.model("Review", reviewSchema); // ✅ VERY IMPORTANT