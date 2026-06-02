import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function Login(){

const navigate = useNavigate();
const { setUser } = useContext(AuthContext);

/* ================= STATES ================= */

const [formData,setFormData] = useState({
email:"",
password:""
});

const [showPassword,setShowPassword] = useState(false);
const [remember,setRemember] = useState(false);
const [loading,setLoading] = useState(false);
const [error,setError] = useState("");

/* ================= CHECK LOGIN ================= */

useEffect(()=>{

const token = localStorage.getItem("token");

if(token){
navigate("/dashboard");
}

},[]);

/* ================= LOAD REMEMBERED EMAIL ================= */

useEffect(()=>{

const savedEmail = localStorage.getItem("rememberUser");

if(savedEmail){
setFormData(prev=>({...prev,email:savedEmail}));
setRemember(true);
}

},[]);

/* ================= INPUT CHANGE ================= */

const handleChange = (e)=>{

setFormData({
...formData,
[e.target.name]:e.target.value
});

};

/* ================= LOGIN ================= */

const handleLogin = async (e)=>{

e.preventDefault();

setLoading(true);
setError("");

try{

const res = await fetch("http://localhost:5000/api/auth/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(formData)
});

const data = await res.json();

if(!res.ok){
throw new Error(data.message || "Login failed");
}

/* SAVE USER */

localStorage.setItem("token",data.token);
localStorage.setItem("user",JSON.stringify(data.user));
localStorage.setItem("role",data.user.role);

/* UPDATE CONTEXT */

setUser(data.user);

/* REMEMBER EMAIL */

if(remember){
localStorage.setItem("rememberUser",formData.email);
}else{
localStorage.removeItem("rememberUser");
}

/* REDIRECT */

if(data.user.role === "admin"){
navigate("/admin");
}else{
navigate("/dashboard");
}

}catch(err){

console.log("Login error:",err);

setError(err.message || "Invalid email or password");

}finally{

setLoading(false);

}

};

/* ================= GOOGLE LOGIN ================= */

const googleLogin = ()=>{

window.location.href = "http://localhost:5000/api/auth/google";

};

/* ================= UI ================= */

return(

<div className="olx-auth-wrapper">

{/* LEFT SIDE */}

<div className="auth-left">

<h1>Login to QuickService</h1>

<p>Find trusted service providers near you</p>

<ul>
<li>✔ Book services instantly</li>
<li>✔ Verified professionals</li>
<li>✔ Safe and secure</li>
</ul>

</div>

{/* RIGHT SIDE */}

<div className="auth-right">

<div className="olx-auth-card">

<h2>Welcome Back</h2>

<p className="auth-sub">Login to continue</p>

{error && (
<div className="auth-error">
{error}
</div>
)}

<form onSubmit={handleLogin}>

{/* EMAIL */}

<div className="input-group">

<FiMail className="input-icon"/>

<input
type="email"
name="email"
required
value={formData.email}
onChange={handleChange}
/>

<label>Email Address</label>

</div>

{/* PASSWORD */}

<div className="input-group">

<FiLock className="input-icon"/>

<input
type={showPassword ? "text":"password"}
name="password"
required
value={formData.password}
onChange={handleChange}
/>

<label>Password</label>

<span
className="toggle-password"
onClick={()=>setShowPassword(!showPassword)}
>

{showPassword ? <FiEyeOff/> : <FiEye/>}

</span>

</div>

{/* OPTIONS */}

<div className="auth-options">

<label className="remember-me">

<input
type="checkbox"
checked={remember}
onChange={()=>setRemember(!remember)}
/>

Remember me

</label>

<Link to="/forgot" className="forgot-link">
Forgot password?
</Link>

</div>

{/* LOGIN BUTTON */}

<button
type="submit"
className="primary-btn"
disabled={loading}
>

{loading ? "Logging in..." : "Login"}

</button>

</form>

{/* DIVIDER */}

<div className="divider">
<span>OR</span>
</div>

{/* GOOGLE LOGIN */}

<button
className="google-btn"
onClick={googleLogin}
>

<FcGoogle size={22}/>

Continue with Google

</button>

{/* FOOTER */}

<div className="auth-footer">

Don’t have an account?

<Link to="/register"> Register</Link>

</div>

</div>

</div>

</div>

);

}