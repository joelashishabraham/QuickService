import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api"; // ✅ IMPORTANT

import { FiUpload, FiMapPin, FiStar, FiPlus } from "react-icons/fi";

export default function CreateService() {

  const navigate = useNavigate();
  const { id } = useParams();
  const editMode = Boolean(id);

  /* ================= STATE ================= */

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [service, setService] = useState({
    title: "",
    category: "",
    price: "",
    district: "",
    area: "",
    description: "",
    lat: null,
    lng: null,
    premium: false
  });

  /* ================= IMAGE ================= */

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);

  /* ================= DISTRICTS ================= */

  const districts = [
    "Thiruvananthapuram","Kollam","Pathanamthitta","Alappuzha",
    "Kottayam","Idukki","Ernakulam","Thrissur","Palakkad",
    "Malappuram","Kozhikode","Wayanad","Kannur","Kasaragod"
  ];

  /* ================= CATEGORY ================= */

  const [categories, setCategories] = useState([
    "Plumbing","Cleaning","Electrician","AC Repair",
    "Painting","Carpentry","Pest Control",
    "Appliance Repair","Home Renovation","Interior Design"
  ]);

  const [newCategory, setNewCategory] = useState("");

  /* ================= AUTO PRICE ================= */

  useEffect(() => {
    const priceMap = {
      Plumbing:500, Cleaning:400, Electrician:600,
      "AC Repair":800, Painting:1200, Carpentry:900
    };

    if (service.category) {
      setService(prev => ({
        ...prev,
        price: priceMap[service.category] || prev.price
      }));
    }
  }, [service.category]);

  /* ================= DESCRIPTION ================= */

  const generateDescription = () => {
    if (!service.category) return;

    setService(prev => ({
      ...prev,
      description: `Professional ${service.category} service in ${prev.area || prev.district}.

✔ Trusted experts
✔ Affordable pricing
✔ Fast service

Book now!`
    }));
  };

  /* ================= ADD CATEGORY ================= */

  const addCategory = () => {
    if (!newCategory) return;

    setCategories(prev => [...prev, newCategory]);
    setService(prev => ({ ...prev, category: newCategory }));
    setNewCategory("");
  };

  /* ================= IMAGE ================= */

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);

  // 🔥 Prevent too many images (optional limit)
  if (images.length + files.length > 5) {
    alert("Maximum 5 images allowed");
    return;
  }

  const newPreviews = files.map(file => URL.createObjectURL(file));

  setImages(prev => [...prev, ...files]);
  setPreview(prev => [...prev, ...newPreviews]);
};

const removeImage = (index) => {
  // 🔥 Free memory (IMPORTANT)
  URL.revokeObjectURL(preview[index]);

  setImages(prev => prev.filter((_, i) => i !== index));
  setPreview(prev => prev.filter((_, i) => i !== index));
};


useEffect(() => {
  return () => {
    preview.forEach(url => URL.revokeObjectURL(url));
  };
}, [preview]);
  /* ================= GPS ================= */

  const handleGPS = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );

        const data = await res.json();

        setService(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          district: data.address?.state_district || "",
          area: data.address?.town || data.address?.village || ""
        }));

      } catch (err) {
        console.log(err);
      }
    });
  };

  /* ================= INPUT ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setService(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  /* ================= SUBMIT ================= */

  const publishService = async () => {

    if (!service.title || !service.category || images.length === 0) {
      alert("Please fill all required fields + image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", service.title);
      formData.append("price", service.price);
      formData.append("city", service.district);
      formData.append("area", service.area);
      formData.append("description", service.description);
      formData.append("category", service.category);
      formData.append("lat", service.lat);
      formData.append("lng", service.lng);
      formData.append("premium", service.premium);

      images.forEach(img => {
        formData.append("images", img); // MUST match backend
      });

      await API.post("/api/services", formData);

      alert("Service Published 🚀");
      navigate("/dashboard");

    } catch (err) {
      console.log(err);
      alert("Upload failed");
    }

    setLoading(false);
  };

  /* ================= UI ================= */

  return (
    <div className="create-service">

      <h2>Create Service</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <motion.div className="service-card">

          <input name="title" placeholder="Title" value={service.title} onChange={handleChange} />

          <select name="category" value={service.category} onChange={handleChange}>
            <option value="">Category</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>

          <input placeholder="New category" value={newCategory} onChange={(e)=>setNewCategory(e.target.value)} />
          <button onClick={addCategory}><FiPlus/> Add</button>

          <input name="price" placeholder="Price" value={service.price} onChange={handleChange} />

          <button onClick={generateDescription}>Generate Description</button>

          <textarea name="description" value={service.description} onChange={handleChange} />

          <button onClick={()=>setStep(2)}>Next</button>

        </motion.div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <motion.div className="service-card">

          <select name="district" value={service.district} onChange={handleChange}>
            <option>District</option>
            {districts.map(d => <option key={d}>{d}</option>)}
          </select>

          <input name="area" value={service.area} onChange={handleChange} placeholder="Area"/>

          <button onClick={handleGPS}><FiMapPin/> Auto Detect</button>

          <button onClick={()=>setStep(3)}>Next</button>
          <button onClick={()=>setStep(1)}>Back</button>

        </motion.div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <motion.div className="service-card">

         <input 
  type="file" 
  multiple 
  accept="image/*" 
  onChange={handleImageUpload} 
/>

<div className="image-preview" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
  {preview.map((img, i) => (
    <div 
      key={i} 
      style={{ 
        position: "relative", 
        width: "100px", 
        height: "100px" 
      }}
    >
      <img 
        src={img} 
        alt="preview"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "10px",
          border: "1px solid #ddd"
        }}
      />

      <button
        type="button"
        onClick={() => removeImage(i)}
        style={{
          position: "absolute",
          top: "-5px",
          right: "-5px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
          cursor: "pointer",
          fontSize: "12px"
        }}
      >
        ×
      </button>
    </div>
  ))}
</div>

          <label>
            <input type="checkbox" name="premium" checked={service.premium} onChange={handleChange}/>
            Premium
          </label>

          <button onClick={publishService}>
            {loading ? "Publishing..." : "Publish"}
          </button>

        </motion.div>
      )}

    </div>
  );
}