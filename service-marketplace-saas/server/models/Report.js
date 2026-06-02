const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({

title:{
type:String,
required:true
},

description:{
type:String,
required:true
},

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

status:{
type:String,
enum:["pending","resolved"],
default:"pending"
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Report",reportSchema);