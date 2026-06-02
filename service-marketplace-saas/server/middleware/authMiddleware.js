const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {

try{

let token;

/* ================= GET TOKEN ================= */

const authHeader = req.headers.authorization;

if(authHeader && authHeader.startsWith("Bearer ")){

token = authHeader.split(" ")[1];

}

/* ================= TOKEN REQUIRED ================= */

if(!token){

return res.status(401).json({
success:false,
message:"Authentication required"
});

}

/* ================= VERIFY TOKEN ================= */

let decoded;

try{

decoded = jwt.verify(token, process.env.JWT_SECRET);

}catch(err){

return res.status(401).json({
success:false,
message:"Invalid or expired token"
});

}

/* ================= GET USER ================= */

const user = await User
.findById(decoded.id)
.select("-password")
.lean();

/* ================= USER NOT FOUND ================= */

if(!user){

return res.status(401).json({
success:false,
message:"User not found"
});

}

/* ================= BLOCK CHECK ================= */

if(user.blocked){

return res.status(403).json({
success:false,
message:"Account is blocked"
});

}

/* ================= ATTACH USER ================= */

req.user = user;
req.userId = user._id;
req.userRole = user.role;

/* ================= CONTINUE ================= */

next();

}catch(error){

console.error("AUTH ERROR:", error);

return res.status(500).json({
success:false,
message:"Authentication error"
});

}

};

module.exports = authMiddleware;