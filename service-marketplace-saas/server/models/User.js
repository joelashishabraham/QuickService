const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
name:{
type:String,
required:true,
trim:true
},

email:{
type:String,
required:true,
unique:true,
lowercase:true
},

password:{
type:String,
required:true
},

role:{
type:String,
enum:["customer","provider","admin"],
default:"customer"
},

phone:{
type:String,
default:""
},

city:{
type:String,
default:""
},

/* PROFILE IMAGE */

avatar:{
type:String,
default:"https://i.pravatar.cc/150?img=12"
},

/* PROVIDER INFO */

bio:{
type:String,
default:""
},

experience:{
type:Number,
default:0
},

rating:{
type:Number,
default:0
},


/* ACCOUNT CONTROL */

blocked:{
type:Boolean,
default:false
}

},
{ timestamps:true }
);

module.exports = mongoose.model("User",userSchema);