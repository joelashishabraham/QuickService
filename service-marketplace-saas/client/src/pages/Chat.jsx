import { useState,useEffect,useRef } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

import {
FiSend, FiPaperclip, FiPhone, FiVideo
} from "react-icons/fi";

import {
FaSmile, FaReply, FaTrash, FaShare, FaEdit
} from "react-icons/fa";

export default function Chat(){

const { state } = useLocation();
const navigate = useNavigate();

const receiverId = state?.receiverId;
const receiverName = state?.receiverName;

/* USER */
let user = {};
try{ user = JSON.parse(localStorage.getItem("user")) || {}; }catch{}
const userId = user?._id || "";
const token = localStorage.getItem("token");

/* STATES */
const [messages,setMessages] = useState([]);
const [text,setText] = useState("");
const [reply,setReply] = useState(null);
const [editing,setEditing] = useState(null);
const [popup,setPopup] = useState(null);
const [typing,setTyping] = useState(false);
const [emojiOpen,setEmojiOpen] = useState(false);
const [preview,setPreview] = useState(null);
const [onlineUsers,setOnlineUsers] = useState([]);

/* REFS */
const socketRef = useRef(null);
const bottomRef = useRef();

/* NORMALIZE */
const normalize = (m)=>{
  let sender = m.sender;

  // FIX: handle object OR string
  if (typeof sender === "object" && sender !== null) {
    sender = sender._id;
  }

  return {
    ...m,
    sender: String(sender),
    delivered: m.delivered || false,
    seen: m.seen || false
  };
};

/* SOCKET */
useEffect(()=>{
  if(!userId) return;

  const socket = io("http://localhost:5000", {
    transports: ["websocket"]
  });

  socketRef.current = socket;

  socket.on("connect", () => {
    socket.emit("join", userId);
  });

  /* NEW MESSAGE */
  socket.on("newMessage",(msg)=>{
    const m = normalize(msg);
    setMessages(prev =>
      prev.some(x=>x._id===m._id) ? prev : [...prev,m]
    );
  });

  /* DELIVERY ✔✔ */
  socket.on("messageDelivered",(id)=>{
    setMessages(prev =>
      prev.map(m =>
        m._id===id ? {...m,delivered:true} : m
      )
    );
  });

  /* SEEN ✔✔ BLUE */
  socket.on("messagesSeen",()=>{
    setMessages(prev =>
      prev.map(m =>
        m.sender===userId ? {...m,seen:true} : m
      )
    );
  });

  /* ONLINE USERS */
  socket.on("onlineUsers",(users)=>{
    setOnlineUsers(users);
  });

  return ()=>socket.disconnect();

},[userId]);

/* LOAD */
useEffect(()=>{
axios.get(`http://localhost:5000/api/chat/${receiverId}`,{
headers:{ Authorization:`Bearer ${token}` }
}).then(res=>{
setMessages(res.data.messages.map(normalize));
});
},[receiverId]);
useEffect(()=>{
  if(socketRef.current){
    socketRef.current.emit("seenMessages",{
      sender:receiverId,
      receiver:userId
    });
  }
},[messages]);

/* SCROLL */
useEffect(()=>{
bottomRef.current?.scrollIntoView({behavior:"smooth"});
},[messages]);

/* SEND */
const sendMessage = async () => {
  if (!text.trim()) return;

  const res = await axios.post(
    "http://localhost:5000/api/chat",
    {
      receiver: receiverId,
      text,
      replyTo: reply?._id || null
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const newMsg = normalize(res.data.data);

  // ✅ UPDATE UI
  setMessages(prev => [...prev, newMsg]);

  // 🔥 ADD THIS (IMPORTANT)
  socketRef.current.emit("sendMessage", {
    ...newMsg,
    receiver: receiverId
  });

  setText("");
  setReply(null);
  setEditing(null);
};

/* EDIT SAVE */
const saveEdit = async()=>{
await axios.put(
`http://localhost:5000/api/chat/${editing._id}`,
{ text },
{ headers:{ Authorization:`Bearer ${token}` } }
);

setMessages(prev =>
prev.map(m=>m._id===editing._id ? {...m,text} : m)
);

setEditing(null);
setText("");
};

/* DELETE */
const deleteMessage = async(id)=>{
await axios.delete(
`http://localhost:5000/api/chat/${id}`,
{ headers:{ Authorization:`Bearer ${token}` } }
);
setMessages(prev=>prev.filter(m=>m._id!==id));
};

/* SHARE */
const shareMessage = (msg)=>{
navigator.clipboard.writeText(msg.text || msg.file || "");
};

/* FILE */
const sendFile = async(e)=>{
const file = e.target.files[0];
const form = new FormData();
form.append("file",file);

const upload = await axios.post("http://localhost:5000/api/upload",form);

await axios.post(
"http://localhost:5000/api/chat",
{ receiver:receiverId, file:upload.data.url },
{ headers:{ Authorization:`Bearer ${token}` } }
);
};

/* UI */

return(

<div className="wa-chat">

{/* HEADER */}
<div className="wa-header glass">

<button onClick={()=>navigate(-1)}>←</button>

<div>
<h4>{receiverName}</h4>

{onlineUsers.includes(receiverId) ? (
<span style={{color:"green",fontSize:"12px"}}>🟢 Online</span>
) : (
<span style={{color:"gray",fontSize:"12px"}}>Offline</span>
)}
</div>

<div className="actions">
<FiPhone/>
<FiVideo/>
</div>

</div>

{/* BODY */}
<div className="wa-body">

{messages.map(msg=>{

const isMe =
  (msg.sender?._id && msg.sender._id === userId) ||
  String(msg.sender) === String(userId);

return(

<motion.div
key={msg._id}
initial={{opacity:0,y:10}}
animate={{opacity:1,y:0}}
className={`wa-msg ${isMe?"me":"other"}`}
>

<div
className="wa-bubble"
onContextMenu={(e)=>{
e.preventDefault();
setPopup(msg);
}}
>

{/* REPLY DISPLAY */}
{msg.replyTo && (
<div className="wa-reply">
↩ {msg.replyTo?.text}
</div>
)}

{msg.text && <p>{msg.text}</p>}

{/* ✅ TIME + TICKS */}
<div className="meta">
<span>
{msg.createdAt
  ? new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  : ""}
</span>

{isMe && (
<span className={`ticks ${msg.seen ? "seen" : ""}`}>
{msg.seen ? "✔✔" : msg.delivered ? "✔✔" : "✔"}
</span>
)}
</div>%

{/* IMAGE */}
{msg.file && msg.file.match(/\.(jpg|png)/) && (
<img src={msg.file} onClick={()=>setPreview(msg.file)} />
)}

{/* FILE */}
{msg.file && !msg.file.match(/\.(jpg|png)/) && (
<div className="file-card">
📎 File <a href={msg.file}>Download</a>
</div>
)}

</div>

</motion.div>
);
})}

<div ref={bottomRef}></div>

</div>

{/* INPUT */}
<div className="wa-input glass">

<button onClick={()=>setEmojiOpen(!emojiOpen)}><FaSmile/></button>

<input
value={text}
onChange={(e)=>setText(e.target.value)}
placeholder={editing ? "Edit message..." : "Message"}
/>

<label>
<FiPaperclip/>
<input type="file" hidden onChange={sendFile}/>
</label>

<button onClick={editing ? saveEdit : sendMessage}>
<FiSend/>
</button>

</div>

{/* REPLY BAR */}
{reply && (
<div className="reply-box">
<span>Reply: {reply.text}</span>
<button onClick={()=>setReply(null)}>✕</button>
</div>
)}

{/* POPUP MENU */}
<AnimatePresence>
{popup && (
<motion.div
className="popup"
initial={{scale:0.8,opacity:0}}
animate={{scale:1,opacity:1}}
exit={{scale:0.8,opacity:0}}
>

<button onClick={()=>{
setReply(popup);
setPopup(null);
}}>
<FaReply/> Reply
</button>

<button onClick={()=>{
setEditing(popup);
setText(popup.text);
setPopup(null);
}}>
<FaEdit/> Edit
</button>

<button onClick={()=>deleteMessage(popup._id)}>
<FaTrash/> Delete
</button>

<button onClick={()=>shareMessage(popup)}>
<FaShare/> Share
</button>

<button onClick={()=>setPopup(null)}>
Cancel
</button>

</motion.div>
)}
</AnimatePresence>

{/* EMOJI */}
{emojiOpen && (
<div className="emoji-box">
{["😀","😂","😍","🔥","❤️"].map(e=>(
<span key={e} onClick={()=>setText(text+e)}>{e}</span>
))}
</div>
)}

{/* PREVIEW */}
{preview && (
<div className="preview" onClick={()=>setPreview(null)}>
<img src={preview}/>
</div>
)}

</div>
);
}