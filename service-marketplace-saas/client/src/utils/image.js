export const getImage = (path)=>{
if(!path) return "https://via.placeholder.com/400";

if(path.startsWith("http")) return path;

return `http://localhost:5000/${path}`;
};