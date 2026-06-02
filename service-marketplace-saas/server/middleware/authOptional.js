const jwt = require("jsonwebtoken");

module.exports = (req,res,next)=>{

const authHeader = req.headers.authorization;

if(!authHeader){
return next();
}

try{

const token = authHeader.split(" ")[1];

const decoded = jwt.verify(token,process.env.JWT_SECRET);

/* FIX: attach userId */

req.userId = decoded.id;
req.user = decoded;

}catch(err){
console.log("Optional auth failed");
}

next();

};