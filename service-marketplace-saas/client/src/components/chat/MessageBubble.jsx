import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
FaTrash,
FaReply,
FaEdit,
FaHeart,
FaSmile
} from "react-icons/fa";

export default function MessageBubble({ msg, currentUser, onDelete, onReply, onUpdate }) {

/* ================= CHECK ================= */

if(!msg) return null;

const senderId = msg.sender?._id || msg.sender;
const isMe = String(senderId) === String(currentUser);

/* ================= STATE ================= */

const [deleting,setDeleting] = useState(false);
const [editing,setEditing] = useState(false);
const [text,setText] = useState(msg.text || "");
const [showReactions,setShowReactions] = useState(false);

/* ================= DELETE ================= */

const deleteMessage = async()=>{

try{

setDeleting(true);

const token = localStorage.getItem("token");

await axios.delete(
`http://localhost:5000/api/messages/${msg._id}`,
{
headers:{ Authorization:`Bearer ${token}` }
}
);

onDelete && onDelete(msg._id);

}catch(err){
console.log(err);
}

setDeleting(false);

};

/* ================= EDIT ================= */

const updateMessage = async()=>{

try{

const token = localStorage.getItem("token");

const res = await axios.put(
`http://localhost:5000/api/messages/${msg._id}`,
{ text },
{
headers:{ Authorization:`Bearer ${token}` }
}
);

onUpdate && onUpdate(res.data.data);

setEditing(false);

}catch(err){
console.log(err);
}

};

/* ================= REACTION ================= */

const react = async(type)=>{

try{

const token = localStorage.getItem("token");

await axios.post(
`http://localhost:5000/api/messages/react/${msg._id}`,
{ reaction:type },
{
headers:{ Authorization:`Bearer ${token}` }
}
);

}catch(err){
console.log(err);
}

setShowReactions(false);

};

/* ================= TIME ================= */

const time = new Date(msg.createdAt || Date.now())
.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

/* ================= UI ================= */

return(

<motion.div
className={`msg-row ${isMe ? "me" : "other"}`}
initial={{opacity:0, y:10}}
animate={{opacity:1, y:0}}
>

<div
className="msg-bubble"
onMouseEnter={()=>setShowReactions(true)}
onMouseLeave={()=>setShowReactions(false)}
>

{/* REPLY */}
{msg.replyTo && (
<div className="reply-preview">
↩ {msg.replyTo?.text || "Media"}
</div>
)}

{/* TEXT / EDIT */}
{editing ? (
<div className="edit-box">
<input
value={text}
onChange={(e)=>setText(e.target.value)}
/>
<button onClick={updateMessage}>Save</button>
</div>
) : (
msg.text && <p className="msg-text">{msg.text}</p>
)}

{/* IMAGE */}
{msg.image && (
<img src={msg.image} alt="" className="msg-image"/>
)}

{/* AUDIO */}
{msg.audio && (
<audio controls className="msg-audio">
<source src={msg.audio}/>
</audio>
)}

{/* FILE */}
{msg.file && !msg.image && !msg.audio && (
<a href={msg.file} target="_blank" rel="noreferrer">
📎 File
</a>
)}

{/* REACTIONS */}
{msg.reaction && (
<div className="reaction">{msg.reaction}</div>
)}

{/* HOVER REACTIONS */}
{showReactions && (
<div className="reaction-box">
<span onClick={()=>react("❤️")}>❤️</span>
<span onClick={()=>react("😂")}>😂</span>
<span onClick={()=>react("👍")}>👍</span>
</div>
)}

{/* META */}
<div className="msg-meta">

<span className="msg-time">{time}</span>

{isMe && (
<span className={`ticks ${msg.seen ? "seen" : ""}`}>
✓✓
</span>
)}

{/* ACTIONS */}
<div className="msg-actions">

<button onClick={()=>onReply(msg)}>
<FaReply/>
</button>

{isMe && (
<>
<button onClick={()=>setEditing(!editing)}>
<FaEdit/>
</button>

<button onClick={deleteMessage} disabled={deleting}>
<FaTrash/>
</button>
</>
)}

</div>

</div>

</div>

</motion.div>

);
}