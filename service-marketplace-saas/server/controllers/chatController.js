const Message = require("../models/Message");

/* ===================================================
   SEND MESSAGE
=================================================== */

exports.sendMessage = async (req,res)=>{
try{

const { receiver, text, file, image, audio, replyTo } = req.body;
const sender = req.user._id;

if(!receiver){
return res.status(400).json({
success:false,
message:"Receiver required"
});
}

/* CREATE MESSAGE */

const message = await Message.create({
sender,
receiver,
text: text || "",
file: file || null,
image: image || null,
audio: audio || null,
replyTo: replyTo || null,
delivered:false,
seen:false
});

/* POPULATE */

const full = await Message.findById(message._id)
.populate("sender","name avatar")
.populate("receiver","name avatar")
.populate("replyTo");

/* ADD isMine */

full._doc.isMine = true;

/* SOCKET */

if(global.io){

// send to receiver
global.io.to(receiver.toString()).emit("newMessage", {
...full._doc,
isMine:false
});

// send to sender
global.io.to(sender.toString()).emit("newMessage", {
...full._doc,
isMine:true
});

// mark delivered
await Message.findByIdAndUpdate(full._id,{ delivered:true });

global.io.to(sender.toString()).emit("messageDelivered", full._id);
}

/* RESPONSE */

res.json({ success:true, data:full });

}catch(err){
console.log("Send error:",err);
res.status(500).json({ success:false });
}
};

/* ===================================================
   GET MESSAGES (WITH isMine)
=================================================== */

exports.getMessages = async (req,res)=>{
try{

const user1 = req.user._id.toString();
const { user2 } = req.params;

const messages = await Message.find({
$or:[
{ sender:user1, receiver:user2 },
{ sender:user2, receiver:user1 }
]
})
.populate("sender","name avatar")
.populate("receiver","name avatar")
.populate("replyTo")
.sort({ createdAt:1 });

/* ADD isMine */

const updatedMessages = messages.map(msg=>({
...msg._doc,
isMine: msg.sender._id.toString() === user1
}));

/* MARK SEEN */

await Message.updateMany({
sender:user2,
receiver:user1,
seen:false
},{ seen:true });

/* SOCKET */

if(global.io){
global.io.to(user2).emit("messagesSeen",{ by:user1 });
}

res.json({
success:true,
messages:updatedMessages
});

}catch(err){
console.log("Chat fetch error:",err);
res.status(500).json({ success:false });
}
};

/* ===================================================
   GET CHAT LIST (WHATSAPP STYLE 🔥)
=================================================== */

exports.getChatList = async (req,res)=>{
try{

const userId = req.user._id.toString();

const messages = await Message.find({
$or:[
{ sender:userId },
{ receiver:userId }
]
})
.sort({ createdAt:-1 })
.populate("sender receiver","name avatar");

const chatMap = {};

messages.forEach(msg=>{

const senderId = msg.sender._id.toString();
const receiverId = msg.receiver._id.toString();

const isSender = senderId === userId;
const otherUser = isSender ? msg.receiver : msg.sender;

if(!otherUser) return;

/* LAST MESSAGE OBJECT */

const lastMessage = {
text: msg.text,
image: msg.image,
audio: msg.audio,
file: msg.file,
createdAt: msg.createdAt
};

/* CREATE CHAT */

if(!chatMap[otherUser._id]){

chatMap[otherUser._id] = {
user:otherUser,
lastMessage,
unreadCount: isSender ? 0 : (!msg.seen ? 1 : 0)
};

}else{

if(!isSender && !msg.seen){
chatMap[otherUser._id].unreadCount += 1;
}

}

});

/* SORT */

const chats = Object.values(chatMap).sort((a,b)=>
new Date(b.lastMessage.createdAt) -
new Date(a.lastMessage.createdAt)
);

res.json({
success:true,
data:chats
});

}catch(err){
console.log("Chat list error:",err);
res.status(500).json({ success:false });
}
};

/* ===================================================
   DELETE MESSAGE
=================================================== */

exports.deleteMessage = async (req,res)=>{
try{

const message = await Message.findById(req.params.id);

if(!message){
return res.status(404).json({ success:false });
}

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
};

/* ===================================================
   EDIT MESSAGE
=================================================== */

exports.editMessage = async (req,res)=>{
try{

const { text } = req.body;

const message = await Message.findById(req.params.id);

if(!message){
return res.status(404).json({ success:false });
}

if(message.sender.toString() !== req.user._id.toString()){
return res.status(403).json({ success:false });
}

message.text = text;
await message.save();

const updated = await Message.findById(message._id)
.populate("sender","name avatar")
.populate("receiver","name avatar");

/* ADD isMine */

updated._doc.isMine = true;

/* SOCKET */

if(global.io){
global.io.to(message.receiver.toString()).emit("messageEdited", {
...updated._doc,
isMine:false
});
global.io.to(message.sender.toString()).emit("messageEdited", {
...updated._doc,
isMine:true
});
}

res.json({ success:true, data:updated });

}catch(err){
console.log("Edit error:",err);
res.status(500).json({ success:false });
}
};

/* ===================================================
   REACT MESSAGE
=================================================== */

exports.reactMessage = async (req,res)=>{
try{

const { reaction } = req.body;

const message = await Message.findById(req.params.id);

if(!message){
return res.status(404).json({ success:false });
}

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

const updated = await Message.findById(message._id)
.populate("sender","name avatar")
.populate("receiver","name avatar");

/* SOCKET */

if(global.io){
global.io.to(message.receiver.toString()).emit("messageReacted", updated);
global.io.to(message.sender.toString()).emit("messageReacted", updated);
}

res.json({ success:true, data:updated });

}catch(err){
console.log("Reaction error:",err);
res.status(500).json({ success:false });
}
};

/* ===================================================
   BULK DELETE
=================================================== */

exports.deleteMany = async (req,res)=>{
try{

const { ids } = req.body;

if(!Array.isArray(ids)){
return res.status(400).json({ success:false });
}

await Message.deleteMany({
_id:{ $in:ids },
sender:req.user._id
});

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
};