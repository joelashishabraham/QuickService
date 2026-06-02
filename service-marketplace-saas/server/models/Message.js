const mongoose = require("mongoose");

/* ===================================================
   MESSAGE SCHEMA
=================================================== */

const messageSchema = new mongoose.Schema({

/* ================= USERS ================= */

sender:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true,
index:true
},

receiver:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true,
index:true
},

/* ================= CONTENT ================= */

text:{
type:String,
trim:true,
default:""
},

image:{
type:String,
default:null
},

audio:{
type:String,
default:null
},

file:{
type:String,
default:null
},

/* ================= TYPE ================= */

type:{
type:String,
enum:["text","image","audio","file"],
default:"text"
},

/* ================= REPLY ================= */

replyTo:{
type:mongoose.Schema.Types.ObjectId,
ref:"Message",
default:null
},

/* ================= STATUS ================= */

seen:{
type:Boolean,
default:false
},

delivered:{
type:Boolean,
default:false
},

/* ================= REACTIONS ================= */

reactions:[
{
user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},
emoji:{
type:String,
required:true
}
}
]

},{
timestamps:true
});

/* ===================================================
   INDEXES (PERFORMANCE BOOST)
=================================================== */

messageSchema.index({ sender:1, receiver:1 });
messageSchema.index({ createdAt:-1 });
messageSchema.index({ receiver:1, seen:1 });

/* ===================================================
   PRE SAVE (AUTO TYPE DETECT)
=================================================== */

messageSchema.pre("save",function(next){

if(this.image) this.type = "image";
else if(this.audio) this.type = "audio";
else if(this.file) this.type = "file";
else this.type = "text";

next();

});

/* ===================================================
   METHODS
=================================================== */

/* MARK AS SEEN */
messageSchema.methods.markSeen = function(){
this.seen = true;
return this.save();
};

/* MARK AS DELIVERED */
messageSchema.methods.markDelivered = function(){
this.delivered = true;
return this.save();
};

/* ADD REACTION */
messageSchema.methods.addReaction = function(userId,emoji){

const existing = this.reactions.find(r =>
r.user.toString() === userId.toString()
);

if(existing){
existing.emoji = emoji;
}else{
this.reactions.push({ user:userId, emoji });
}

return this.save();
};

/* REMOVE REACTION */
messageSchema.methods.removeReaction = function(userId){

this.reactions = this.reactions.filter(r =>
r.user.toString() !== userId.toString()
);

return this.save();
};

/* ===================================================
   STATIC METHODS
=================================================== */

/* GET CHAT BETWEEN USERS */
messageSchema.statics.getConversation = function(user1,user2){

return this.find({
$or:[
{ sender:user1, receiver:user2 },
{ sender:user2, receiver:user1 }
]
})
.populate("sender","name avatar")
.populate("receiver","name avatar")
.populate("replyTo")
.sort({ createdAt:1 });

};

/* MARK ALL SEEN */
messageSchema.statics.markAllSeen = function(sender,receiver){

return this.updateMany({
sender,
receiver,
seen:false
},{ seen:true });

};

/* ===================================================
   CLEAN RESPONSE (REMOVE __v)
=================================================== */

messageSchema.set("toJSON",{
transform:(doc,ret)=>{
delete ret.__v;
return ret;
}
});

/* ===================================================
   EXPORT
=================================================== */

module.exports = mongoose.model("Message",messageSchema);