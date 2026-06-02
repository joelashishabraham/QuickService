import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOtp(){

const { state } = useLocation();
const navigate = useNavigate();

const email = state?.email;

/* ================= STATES ================= */

const [otp,setOtp] = useState(["","","","","",""]);
const [timeLeft,setTimeLeft] = useState(30);
const [loading,setLoading] = useState(false);

/* ================= REFS ================= */

const inputsRef = useRef([]);

/* ================= AUTO FOCUS ================= */

useEffect(()=>{
inputsRef.current[0]?.focus();
},[]);

/* ================= TIMER ================= */

useEffect(()=>{

if(timeLeft === 0) return;

const timer = setInterval(()=>{
setTimeLeft(prev => prev - 1);
},1000);

return ()=>clearInterval(timer);

},[timeLeft]);

/* ================= HANDLE CHANGE ================= */

const handleChange = (value,index)=>{

if(!/^[0-9]?$/.test(value)) return;

const newOtp = [...otp];
newOtp[index] = value;
setOtp(newOtp);

/* MOVE NEXT */
if(value && index < 5){
inputsRef.current[index+1].focus();
}

};

/* ================= BACKSPACE ================= */

const handleKeyDown = (e,index)=>{

if(e.key === "Backspace" && !otp[index] && index > 0){
inputsRef.current[index-1].focus();
}

};

/* ================= PASTE ================= */

const handlePaste = (e)=>{

const paste = e.clipboardData.getData("text").slice(0,6);

if(!/^\d+$/.test(paste)) return;

const newOtp = paste.split("");
setOtp(newOtp);

newOtp.forEach((val,i)=>{
if(inputsRef.current[i]){
inputsRef.current[i].value = val;
}
});

};

/* ================= VERIFY ================= */

const verify = async ()=>{

const finalOtp = otp.join("");

if(finalOtp.length !== 6){
return showNotification("Enter complete OTP");
}

setLoading(true);

try{

const res = await fetch("http://localhost:5000/api/auth/verify-otp",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ email, otp: finalOtp })
});

const data = await res.json();

if(data.success){
showNotification("Verified ✅");
navigate("/login");
}else{
showNotification(data.message);
}

}catch(err){
showNotification("Verification failed");
}

setLoading(false);

};

/* ================= RESEND ================= */

const resendOtp = async ()=>{

try{

await fetch("http://localhost:5000/api/auth/resend-otp",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ email })
});

setTimeLeft(30);
showNotification("OTP sent again");

}catch{
showNotification("Failed to resend OTP");
}

};

/* ================= UI ================= */

return(

<div className="otp-container">

<div className="otp-card">

<h2>Verify OTP</h2>
<p>Sent to <b>{email}</b></p>

{/* OTP BOXES */}
<div className="otp-boxes" onPaste={handlePaste}>

{otp.map((digit,index)=>(
<input
key={index}
type="text"
maxLength="1"
value={digit}
ref={(el)=>inputsRef.current[index]=el}
onChange={(e)=>handleChange(e.target.value,index)}
onKeyDown={(e)=>handleKeyDown(e,index)}
/>
))}

</div>

{/* TIMER */}
<div className="otp-timer">

{timeLeft > 0 ? (
<span>Resend in {timeLeft}s</span>
) : (
<button onClick={resendOtp}>Resend OTP</button>
)}

</div>

{/* VERIFY BUTTON */}
<button
className="verify-btn"
onClick={verify}
disabled={loading}
>
{loading ? "Verifying..." : "Verify OTP"}
</button>

</div>

</div>

);
}