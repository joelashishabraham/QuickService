const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");

/* ================= HELPER ================= */

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ==================================================
   SEND MESSAGE
================================================== */

router.post("/", auth, async (req,res)=>{

try{

const { receiver, text, file, image, audio, replyTo } = req.body;

if(!receiver){
return res.status(400).json({
success:false,
message:"Receiver required"
});
}

/* CREATE MESSAGE */

const message = await Message.create({
sender:req.user._id,
receiver,
text: text || "",
file: file || null,
image: image || null,
audio: audio || null,
replyTo: replyTo || null
});

/* POPULATE */

const fullMessage = await Message.findById(message._id)
.populate("sender","name avatar")
.populate("receiver","name avatar")
.populate("replyTo");

/* SOCKET EVENTS */

if(global.io){

// send to receiver
global.io.to(receiver.toString()).emit("newMessage", fullMessage);

// send to sender (multi-device sync)
global.io.to(req.user._id.toString()).emit("newMessage", fullMessage);

// delivered status
global.io.to(req.user._id.toString()).emit("messageDelivered", fullMessage._id);
}

/* RESPONSE */

res.json({
success:true,
data:fullMessage
});

}catch(err){
console.log("Send message error:",err);
res.status(500).json({ success:false });
}

});

/* ==================================================
   GET CONVERSATION LIST (FIXED STRUCTURE)
================================================== */

router.get("/conversations/list", auth, async (req,res)=>{

try{

const userId = req.user._id;

/* FETCH ALL RELATED MESSAGES */

const messages = await Message.find({
$or:[
{ sender:userId },
{ receiver:userId }
]
})
.populate("sender","name avatar")
.populate("receiver","name avatar")
.sort({ createdAt:-1 });

const chatMap = {};

/* BUILD CHAT LIST */

messages.forEach(msg=>{

const isSender = msg.sender._id.toString() === userId.toString();
const otherUser = isSender ? msg.receiver : msg.sender;

if(!otherUser) return;

if(!chatMap[otherUser._id]){

chatMap[otherUser._id] = {
user: otherUser,

lastMessage: {
text: msg.text,
image: msg.image,
audio: msg.audio,
file: msg.file,
createdAt: msg.createdAt
},

unreadCount: isSender ? 0 : (!msg.seen ? 1 : 0)
};

}else{

if(!isSender && !msg.seen){
chatMap[otherUser._id].unreadCount += 1;
}

}

});

res.json({
success:true,
data:Object.values(chatMap)
});

}catch(err){
console.log("Chat list error:",err);
res.status(500).json({ success:false });
}

});

/* ==================================================
   GET MESSAGES (CHAT SCREEN)
================================================== */

router.get("/:receiverId", auth, async (req,res)=>{

try{

const userId = req.user._id;
const { receiverId } = req.params;

if(!isValidId(receiverId)){
return res.status(400).json({ success:false });
}

/* FETCH MESSAGES */

const messages = await Message.find({
$or:[
{ sender:userId, receiver:receiverId },
{ sender:receiverId, receiver:userId }
]
})
.populate("sender","name avatar")
.populate("receiver","name avatar")
.populate("replyTo")
.sort({ createdAt:1 });

/* MARK AS SEEN */

await Message.updateMany({
sender:receiverId,
receiver:userId,
seen:false
},{ seen:true });

/* SOCKET SEEN EVENT */

if(global.io){
global.io.to(receiverId.toString()).emit("messagesSeen",{
by:userId
});
}

res.json({
success:true,
messages
});

}catch(err){
console.log("Get messages error:",err);
res.status(500).json({ success:false });
}

});

/* ==================================================
   EDIT MESSAGE
================================================== */

router.put("/:messageId", auth, async (req,res)=>{

try{

const { text } = req.body;

const message = await Message.findById(req.params.messageId);

if(!message){
return res.status(404).json({ success:false });
}

/* ONLY OWNER CAN EDIT */

if(message.sender.toString() !== req.user._id.toString()){
return res.status(403).json({ success:false });
}

message.text = text;
await message.save();

/* POPULATE */

const updated = await Message.findById(message._id)
.populate("sender","name avatar")
.populate("receiver","name avatar");

/* SOCKET */

if(global.io){
global.io.to(message.receiver.toString()).emit("messageEdited",updated);
global.io.to(message.sender.toString()).emit("messageEdited",updated);
}

res.json({
success:true,
data:updated
});

}catch(err){
console.log("Edit error:",err);
res.status(500).json({ success:false });
}

});

/* ==================================================
   DELETE MESSAGE
================================================== */

router.delete("/:messageId", auth, async (req,res)=>{

try{

const message = await Message.findById(req.params.messageId);

if(!message){
return res.status(404).json({ success:false });
}

/* ONLY OWNER */

if(message.sender.toString() !== req.user._id.toString()){
return res.status(403).json({ success:false });
}

await message.deleteOne();

/* SOCKET */

if(global.io){
global.io.to(message.receiver.toString()).emit("messageDeleted", message._id);
global.io.to(message.sender.toString()).emit("messageDeleted", message._id);
}

res.json({ success:true });

}catch(err){
console.log("Delete error:",err);
res.status(500).json({ success:false });
}

});

/* ==================================================
   REACT TO MESSAGE
================================================== */

router.post("/react/:messageId", auth, async (req,res)=>{

try{

const { reaction } = req.body;

const message = await Message.findById(req.params.messageId);

if(!message){
return res.status(404).json({ success:false });
}

/* UPDATE REACTION */

const existing = message.reactions.find(r =>
r.user.toString() === req.user._id.toString()
);

if(existing){
existing.emoji = reaction;
}else{
message.reactions.push({
user:req.user._id,
emoji:reaction
});
}

await message.save();

/* POPULATE */

const updated = await Message.findById(message._id)
.populate("sender","name avatar")
.populate("receiver","name avatar");

/* SOCKET */

if(global.io){
global.io.to(message.receiver.toString()).emit("messageReacted",updated);
global.io.to(message.sender.toString()).emit("messageReacted",updated);
}

res.json({
success:true,
data:updated
});

}catch(err){
console.log("Reaction error:",err);
res.status(500).json({ success:false });
}

});

/* ==================================================
   BULK DELETE
================================================== */

router.post("/delete-many", auth, async (req,res)=>{

try{

const { ids } = req.body;

if(!Array.isArray(ids)){
return res.status(400).json({ success:false });
}

/* DELETE OWN MESSAGES */

await Message.deleteMany({
_id:{ $in:ids },
sender:req.user._id
});

/* SOCKET */

if(global.io){
ids.forEach(id=>{
global.io.emit("messageDeleted", id);
});
}

res.json({ success:true });

}catch(err){
console.log("Bulk delete error:",err);
res.status(500).json({ success:false });
}

});

/* ==================================================
   CLEAR CHAT (BONUS FEATURE 🔥)
================================================== */

router.delete("/clear/:receiverId", auth, async (req,res)=>{

try{

const userId = req.user._id;
const { receiverId } = req.params;

await Message.deleteMany({
$or:[
{ sender:userId, receiver:receiverId },
{ sender:receiverId, receiver:userId }
]
});

/* SOCKET */

if(global.io){
global.io.to(receiverId.toString()).emit("chatCleared",{
by:userId
});
}

res.json({ success:true });

}catch(err){
console.log("Clear chat error:",err);
res.status(500).json({ success:false });
}

});

module.exports = router;