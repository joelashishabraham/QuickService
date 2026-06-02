const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

/* ================= BOOKING ID ================= */

bookingId:{
type:String,
unique:true
},

/* ================= USERS ================= */

customer:{
type: mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

provider:{
type: mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

/* ================= SERVICE ================= */

service:{
type: mongoose.Schema.Types.ObjectId,
ref:"Service",
required:true
},

/* ================= DATE & TIME ================= */

date:{
type:Date,
required:true
},

time:{
type:String,
required:true
},

/* ================= CONTACT ================= */

phone:{
type:String
},

address:{
type:String,
required:true
},

/* ================= SERVICE DETAILS ================= */

problem:{
type:String,
default:"General Service"
},

/* ================= PRICE ================= */

price:{
type:Number,
required:true
},

/* ================= PAYMENT ================= */

paymentMethod:{
type:String,
enum:["card","upi","cod"],
default:"cod"
},

paymentStatus:{
type:String,
enum:["pending","paid","failed"],
default:"pending"
},

/* ================= BOOKING STATUS ================= */

status:{
type:String,
enum:[
"pending",
"accepted",
"rejected",
"completed",
"cancelled"
],
default:"pending"
}

},{timestamps:true});


module.exports = mongoose.model("Booking",bookingSchema);