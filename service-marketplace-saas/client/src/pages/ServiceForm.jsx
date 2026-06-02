import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


export default function ServiceForm({ editMode = false }) {

const navigate = useNavigate();
const { id } = useParams();

const token = localStorage.getItem("token");

const [service, setService] = useState({
name: "",
price: "",
city: "",
description: "",
image: ""
});

const [loading, setLoading] = useState(false);

/* ================= LOAD SERVICE ================= */

useEffect(() => {

if (editMode) {
fetchService();
}

}, []);

/* ================= FETCH SERVICE ================= */

const fetchService = async () => {

setLoading(true);

try {

const res = await fetch(`http://localhost:5000/api/services/${id}`);
const data = await res.json();

if (data.success) {
setService(data.data);
}

} catch (err) {

console.log(err);

}

setLoading(false);

};

/* ================= HANDLE INPUT ================= */

const handleChange = (e) => {

setService({
...service,
[e.target.name]: e.target.value
});

};

/* ================= SUBMIT ================= */

const handleSubmit = async (e) => {

e.preventDefault();

try {

const url = editMode
? `http://localhost:5000/api/services/${id}`
: "http://localhost:5000/api/services";

const method = editMode ? "PUT" : "POST";

const res = await fetch(url, {
method,
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${token}`
},
body: JSON.stringify(service)
});

const data = await res.json();

if (data.success) {

alert(editMode ? "Service Updated Successfully" : "Service Created Successfully");

navigate("/dashboard");

}

} catch (err) {

console.log(err);

}

};

if (loading) {
return (
<div className="loading-page">
<div className="loader"></div>
<p>Loading service...</p>
</div>
);
}

return (

<div className="service-page">

<div className="service-card">

<h1 className="service-title">
{editMode ? "Edit Service" : "Create Service"}
</h1>

<form onSubmit={handleSubmit} className="service-form">

<div className="form-grid">

<div className="input-group">
<label>Service Name</label>
<input
type="text"
name="name"
value={service.name}
onChange={handleChange}
placeholder="Electrician, Plumber..."
required
/>
</div>

<div className="input-group">
<label>Price</label>
<input
type="number"
name="price"
value={service.price}
onChange={handleChange}
placeholder="₹ Price"
/>
</div>

<div className="input-group">
<label>City</label>
<input
type="text"
name="city"
value={service.city}
onChange={handleChange}
placeholder="Kochi, Kottayam..."
/>
</div>

<div className="input-group full">
<label>Description</label>
<textarea
name="description"
value={service.description}
onChange={handleChange}
placeholder="Service description"
/>
</div>

<div className="input-group full">
<label>Image URL</label>
<input
type="text"
name="image"
value={service.image}
onChange={handleChange}
placeholder="https://image-url"
/>
</div>

</div>

<div className="button-group">

<button type="submit" className="btn btn-primary">
{editMode ? "Update Service" : "Create Service"}
</button>

<button
type="button"
className="btn btn-secondary"
onClick={() => navigate("/dashboard")}
>
Cancel
</button>

</div>

</form>

</div>

</div>

);

}