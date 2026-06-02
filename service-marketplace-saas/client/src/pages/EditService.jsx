import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditService(){

const navigate = useNavigate();
const { id } = useParams();

const token = localStorage.getItem("token");

const [loading,setLoading] = useState(true);
const [saving,setSaving] = useState(false);

const [service,setService] = useState({
name:"",
price:"",
city:"",
description:"",
images:[],
category:"",
phone:"",

premium:false,

tags:[],
slots:[],

couponCode:"",
couponDiscount:"",
couponExpiry:"",
couponLimit:"",
couponActive:false
});

const [preview,setPreview] = useState([]);
const [newImages,setNewImages] = useState([]);

/* ================= LOAD SERVICE ================= */

useEffect(()=>{
fetchService()
},[])

const fetchService = async()=>{

try{

const res = await fetch(`http://localhost:5000/api/services/${id}`);
const data = await res.json();

if(data.success){

const s = data.data;

setService({
name:s.name || "",
price:s.price || "",
city:s.city || "",
description:s.description || "",
images:s.images || [],
category:s.category || "",
phone:s.phone || "",

premium:s.premium || false,

tags:s.tags || [],
slots:s.slots || [],

couponCode:s.couponCode || "",
couponDiscount:s.couponDiscount || "",
couponExpiry:s.couponExpiry || "",
couponLimit:s.couponLimit || "",
couponActive:s.couponActive || false
});

setPreview(s.images || []);
}

}catch(err){
console.log("Fetch error:",err)
}

setLoading(false)
};

/* ================= HANDLE INPUT ================= */

const handleChange = (e)=>{
const { name,value,type,checked } = e.target;

setService({
...service,
[name]: type === "checkbox" ? checked : value
});
};

/* ================= IMAGE HANDLING ================= */

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  const previews = files.map(file => URL.createObjectURL(file));

  setNewImages(prev => [...prev, ...files]);
  setPreview(prev => [...prev, ...previews]);
};

const removeImage = (index) => {

  const img = preview[index];

  if(img?.startsWith("blob:")){
    URL.revokeObjectURL(img);
  }

  setPreview(prev => prev.filter((_, i) => i !== index));
};

/* ================= UPDATE SERVICE ================= */

const updateService = async(e)=>{

e.preventDefault();

if(!service.name || !service.price || !service.city){
alert("Please fill required fields");
return;
}

// 🔥 CHECK TOKEN
if(!token){
alert("Session expired. Please login again.");
navigate("/login");
return;
}

setSaving(true);

try{

const formData = new FormData();

// ✅ append fields
Object.keys(service).forEach(key=>{
  if(key !== "images"){
    formData.append(key, service[key]);
  }
});

// ✅ existing images
service.images?.forEach(img=>{
  formData.append("existingImages", img);
});

// ✅ new images
newImages.forEach(img=>{
  formData.append("images", img);
});

// 🔥 DEBUG
console.log("TOKEN:", token);
console.log("FORM DATA:", [...formData]);

const res = await fetch(
`http://localhost:5000/api/services/${id}`,
{
method:"PUT",
headers:{
Authorization:`Bearer ${token}`
},
body: formData
}
);

// 🔥 HANDLE 403
if(res.status === 403){
alert("❌ Unauthorized (403). Please login again.");
navigate("/login");
return;
}

const data = await res.json();

if(data.success){
alert("✅ Service updated");
navigate("/dashboard");
}else{
alert(data.message || "Update failed");
}

}catch(err){
console.log(err);
alert("Server error");
}

setSaving(false);
};

/* ================= DELETE ================= */

const deleteService = async()=>{

const confirmDelete = window.confirm("Delete this service?");
if(!confirmDelete) return;

try{

await fetch(`http://localhost:5000/api/services/${id}`,{
method:"DELETE",
headers:{ Authorization:`Bearer ${token}` }
});

alert("Service deleted");
navigate("/dashboard");

}catch(err){
console.log(err)
}
};

/* ================= LOADING ================= */

if(loading){
return(
<div className="page-loading">
<div className="loader"></div>
<p>Loading service...</p>
</div>
)
}

/* ================= UI ================= */

return(

<div className="edit-service-page">

<div className="edit-card">

<h1>Edit Service</h1>

<form onSubmit={updateService} className="edit-service-form">
<div className="form-grid">

<input name="name" value={service.name} onChange={handleChange}/>
<input name="category" value={service.category} onChange={handleChange}/>
<input type="number" name="price" value={service.price} onChange={handleChange}/>
<input name="city" value={service.city} onChange={handleChange}/>
<input name="phone" value={service.phone} onChange={handleChange}/>
<textarea name="description" value={service.description} onChange={handleChange}/>

{/* 🔥 IMAGE SECTION */}

<div className="input-group full">
<label>Upload Images</label>

<input type="file" multiple accept="image/*" onChange={handleImageUpload}/>

<div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginTop:"10px"}}>

{preview.map((img,i)=>(
<div key={i} style={{position:"relative"}}>

<img src={img} width="100" height="100" style={{objectFit:"cover",borderRadius:"8px"}}/>

<button
type="button"
onClick={()=>removeImage(i)}
style={{
position:"absolute",
top:"-5px",
right:"-5px",
background:"red",
color:"white",
border:"none",
borderRadius:"50%",
width:"20px",
height:"20px",
cursor:"pointer"
}}
>
×
</button>

</div>
))}

</div>
</div>

<label className="checkbox">
<input type="checkbox" name="premium" checked={service.premium} onChange={handleChange}/>
Premium Listing
</label>

<div className="form-buttons">

<button type="submit" disabled={saving}>
{saving ? "Updating..." : "Update Service"}
</button>

<button type="button" onClick={()=>navigate("/dashboard")}>
Cancel
</button>

<button type="button" onClick={deleteService}>
Delete Service
</button>

</div>

</div>
</form>

</div>
</div>

)

}