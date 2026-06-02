import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
FiSend,
FiUser,
FiCpu,
FiMessageCircle,
FiX,
FiMic,
FiImage
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Chatbot(){

const navigate = useNavigate();

const [open, setOpen] = useState(false);
const [unread, setUnread] = useState(0);

const [messages, setMessages] = useState([
{
role: "assistant",
content: "👋 Hi! What i can do for You.",
time: new Date()
}
]);

const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const [preview, setPreview] = useState(null);

const bottomRef = useRef(null);
const inputRef = useRef(null);
const fileRef = useRef(null);

/* ================= AUTO SCROLL ================= */
useEffect(()=>{
bottomRef.current?.scrollIntoView({ behavior:"smooth" });
},[messages]);

/* ================= AUTO FOCUS ================= */
useEffect(()=>{
if(open){
setTimeout(()=>inputRef.current?.focus(),200);
}
},[open]);

/* ================= UNREAD ================= */
useEffect(()=>{
if(!open && messages.length > 1){
setUnread(prev => prev + 1);
}
},[messages, open]);

/* ================= TEXTAREA RESIZE ================= */
useEffect(()=>{
if(inputRef.current){
inputRef.current.style.height = "auto";
inputRef.current.style.height = inputRef.current.scrollHeight + "px";
}
},[input]);

/* ================= CLEAN PREVIEW ================= */
useEffect(()=>{
return ()=>{
if(preview){
URL.revokeObjectURL(preview);
}
};
},[preview]);

/* ================= SEND MESSAGE ================= */

const sendMessage = async ()=>{

if(!input.trim() || loading) return;

const userMsg = {
role:"user",
content:input.trim(),
time:new Date()
};

setMessages(prev => [...prev, userMsg]);
setInput("");

try{
setLoading(true);

const res = await axios.post(
"http://localhost:5000/api/ai/chat",
{
message: input,
history: messages.map(m => ({
role: m.role,
content: m.content
}))
}
);

const data = res.data;

const botMsg = {
role:"assistant",
content: data.reply || "I can help you 😊",
services: data.services || [],
topServices: data.topServices || [],
bookingPrompt: data.bookingPrompt || false,
time:new Date()
};

setMessages(prev => [...prev, botMsg]);

}catch(err){
console.log("CHAT ERROR:", err);

setMessages(prev => [...prev,{
role:"assistant",
content:"⚠️ AI failed. Try again.",
time:new Date()
}]);
}finally{
setLoading(false);
}
};

/* ================= VOICE INPUT ================= */

const startVoice = ()=>{

try{

const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition;

if(!SpeechRecognition){
alert("Voice not supported in your browser");
return;
}

const recognition = new SpeechRecognition();

recognition.lang = "en-IN";
recognition.interimResults = false;

recognition.onresult = (e)=>{
setInput(e.results[0][0].transcript);
};

recognition.onerror = ()=>{
alert("Voice recognition failed");
};

recognition.start();

}catch{
alert("Voice error");
}
};

/* ================= IMAGE UPLOAD ================= */

const handleImage = async (file)=>{

if(!file) return;

/* VALIDATE */
if(!file.type.startsWith("image/")){
alert("Only images allowed");
return;
}

/* PREVIEW */
const previewURL = URL.createObjectURL(file);
setPreview(previewURL);

/* USER MESSAGE */
setMessages(prev => [...prev,{
role:"user",
content:"📸 Image uploaded",
time:new Date()
}]);

const formData = new FormData();
formData.append("image", file);

try{
setLoading(true);

const res = await axios.post(
"http://localhost:5000/api/ai/image",
formData
);

const data = res.data;

setMessages(prev => [...prev,{
role:"assistant",
content: `${data.problem || ""}\n${data.advice || ""}`,
services: data.services || [],
bookingPrompt: true,
time:new Date()
}]);

}catch(err){
console.log("IMAGE ERROR:", err);

setMessages(prev => [...prev,{
role:"assistant",
content:"⚠️ Image analysis failed",
time:new Date()
}]);
}finally{
setLoading(false);
setPreview(null);
}
};

/* ================= TIME ================= */

const formatTime = (date)=>{
return new Date(date).toLocaleTimeString([], {
hour:"2-digit",
minute:"2-digit"
});
};

/* ================= UI ================= */

return(
<>
{/* FLOAT BUTTON */}
<button
className="chat-toggle"
onClick={()=>{
setOpen(!open);
setUnread(0);
}}
>
<FiMessageCircle/>
{unread>0 && <span className="badge">{unread}</span>}
</button>

{/* CHAT WINDOW */}
{open && (
<div className="chat-popup">

{/* HEADER */}
<div className="chat-header">
<h3>🤖 AI Assistant</h3>
<FiX onClick={()=>setOpen(false)} className="close-btn"/>
</div>

{/* BODY */}
<div className="chat-body">

{messages.map((msg,i)=>(
<div key={i} className={`chat-msg ${msg.role}`}>

<div className="icon">
{msg.role==="user"?<FiUser/>:<FiCpu/>}
</div>

<div className="bubble">

<p>{msg.content}</p>
<span className="time">{formatTime(msg.time)}</span>

{/* CATEGORY */}
{msg.services?.map((s,i)=>(
<button
key={i}
className="service-btn"
onClick={()=>navigate(`/services?category=${s}`)}
>
🔧 {s}
</button>
))}

{/* SERVICE CARDS */}
{msg.topServices?.map((s)=>(
<div key={s._id} className="mini-card">
<h4>{s.name}</h4>
<p>₹{s.price}</p>
<button onClick={()=>navigate(`/service/${s._id}`)}>
View
</button>
</div>
))}

{/* BOOK */}
{msg.bookingPrompt && msg.services?.length>0 && (
<button
className="book-btn"
onClick={()=>{
navigate(`/services?category=${msg.services[0]}&autoBook=true`);
}}
>
🚀 Book {msg.services[0]}
</button>
)}

</div>
</div>
))}

{/* IMAGE PREVIEW */}
{preview && (
<div className="image-preview">
<img src={preview} alt="preview"/>
</div>
)}

{/* LOADING */}
{loading && (
<div className="chat-msg assistant">
<div className="bubble typing">
Typing<span>.</span><span>.</span><span>.</span>
</div>
</div>
)}

<div ref={bottomRef}></div>

</div>

{/* INPUT */}
<div className="chat-input">

<button onClick={startVoice} disabled={loading}>
<FiMic/>
</button>

<button onClick={()=>fileRef.current.click()} disabled={loading}>
<FiImage/>
</button>

<input
type="file"
hidden
ref={fileRef}
onChange={(e)=>handleImage(e.target.files[0])}
/>

<textarea
ref={inputRef}
value={input}
onChange={(e)=>setInput(e.target.value)}
placeholder="Type or speak..."
rows={1}
/>

<button onClick={sendMessage} disabled={loading}>
<FiSend/>
</button>

</div>

</div>
)}
</>
);
}