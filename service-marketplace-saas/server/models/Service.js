const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({

/* ================= BASIC INFO ================= */

name:{
type:String,
required:true,
trim:true,
maxlength:120
},

description:{
type:String,
required:true,
maxlength:2000
},

price:{
type:Number,
required:true,
min:0
},

city:{
type:String,
required:true,
index:true
},

category:{
type:String,
default:"General",
index:true
},

images:{
type:[String],
default:[]
},

provider:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true,
index:true
},

/* ================= STATUS ================= */

active:{
type:Boolean,
default:true,
index:true
},

/* ================= ADVERTISEMENT ================= */

premium:{
type:Boolean,
default:false,
index:true
},

boosted:{
type:Boolean,
default:false,
index:true
},

boostExpiry:{
type:Date,
default:null
},

isAd:{
type:Boolean,
default:false
},

/* ================= RATINGS ================= */

rating:{
type:Number,
default:4.5,
min:0,
max:5
},

reviews:[
{
user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},
rating:{
type:Number,
min:1,
max:5
},
comment:{
type:String
},
createdAt:{
type:Date,
default:Date.now
}
}
],

reviewsCount:{
type:Number,
default:0
},

/* ================= TRENDING METRICS ================= */

views:{
type:Number,
default:0
},

bookings:{
type:Number,
default:0
},

/* ================= FAVORITES ================= */

favorites:[
{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
}
],

favoritesCount:{
type:Number,
default:0
},

/* ================= DELIVERY OPTION ================= */

delivery:{
type:Boolean,
default:false
},

/* ================= TAGS ================= */

tags:[
{
type:String
}
],

/* ================= LOCATION ================= */

location:{
lat:{
type:Number,
default:null
},
lng:{
type:Number,
default:null
}
},

geoLocation:{
type:{
type:String,
enum:["Point"],
default:"Point"
},
coordinates:{
type:[Number], // [lng, lat]
default:[0,0]
}
},

/* ================= SERVICE RADIUS ================= */

serviceRadius:{
type:Number,
default:30,
min:1,
max:200
},

/* ================= BOOKING SYSTEM ================= */

slots:[
{
type:String
}
],

availability:[
{
type:String
}
],

/* ================= COUPON SYSTEM ================= */

couponCode:{
type:String,
default:null,
uppercase:true,
trim:true
},

couponDiscount:{
type:Number,
default:0,
min:0,
max:100
},

couponActive:{
type:Boolean,
default:false
},

couponExpiry:{
type:Date,
default:null
},

couponLimit:{
type:Number,
default:0
},

couponUsed:{
type:Number,
default:0
},

/* ================= FRAUD PROTECTION ================= */

reported:{
type:Boolean,
default:false
},

reportCount:{
type:Number,
default:0
}

},{ timestamps:true });



/* ================= GEO INDEX ================= */

serviceSchema.index({ geoLocation:"2dsphere" });

/* ================= SEARCH INDEX ================= */

serviceSchema.index({
name:"text",
description:"text",
category:"text"
});


module.exports = mongoose.model("Service",serviceSchema);