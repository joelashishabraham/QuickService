import { useNavigate } from "react-router-dom";

export default function ChatItem({ chat, isOnline }) {

const navigate = useNavigate();

/* ================= SAFE DATA ================= */

const user = chat?.user || {};
const last = chat?.lastMessage;

/* ================= LAST MESSAGE ================= */

let lastText = "No messages";

if(typeof last === "object"){
lastText =
last?.text ||
(last?.image && "📷 Image") ||
(last?.audio && "🎤 Voice") ||
(last?.file && "📎 File") ||
"Message";
}else{
lastText = last || "No messages";
}

/* ================= TIME ================= */

const time = chat?.time
? new Date(chat.time).toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
})
: "";

/* ================= AVATAR ================= */

const avatar = user?.avatar
? `http://localhost:5000/${user.avatar}`
: `https://ui-avatars.com/api/?name=${user?.name}`;

/* ================= CLICK ================= */

const openChat = ()=>{

if(!user?._id) return;

navigate("/chat",{
state:{
receiverId:user._id,
receiverName:user.name
}
});

};

/* ================= UI ================= */

return(

<div className="chat-item" onClick={openChat}>

{/* AVATAR */}
<div className="chat-avatar">

<img src={avatar} alt={user?.name}/>

{/* ONLINE DOT */}
{isOnline && <span className="online-dot"></span>}

</div>

{/* INFO */}
<div className="chat-info">

<div className="chat-top">

<h4>{user?.name || "User"}</h4>

<span className="chat-time">{time}</span>

</div>

<p className="chat-last">{lastText}</p>

</div>

{/* UNREAD */}
{chat?.unread > 0 && (
<div className="chat-unread">
{chat.unread}
</div>
)}

</div>

);

}