import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function NearMeServices() {

  const [services, setServices] = useState([]);
  const [nearServices, setNearServices] = useState([]);
  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(20);
  const [search, setSearch] = useState("");
  const [locationInput, setLocationInput] = useState("");

  const navigate = useNavigate();
  const locationHook = useLocation();

  /* ================= AI INTENT ================= */
  const detectIntent = (text) => {
    const msg = text.toLowerCase();

    if (msg.includes("clean")) return "cleaning";
    if (msg.includes("pipe") || msg.includes("water")) return "plumbing";
    if (msg.includes("ac") || msg.includes("cool")) return "ac repair";
    if (msg.includes("electric")) return "electrician";

    return null;
  };

  /* ================= URL CATEGORY ================= */
  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    const cat = params.get("category");

    if (cat) setSearch(cat);
  }, [locationHook.search]);

  /* ================= CURRENT LOCATION ================= */
  const useCurrentLocation = () => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLoading(false);
      },
      () => {
        alert("Location denied → Using default location");

        // fallback (Kochi)
        setLocation({ lat: 9.9312, lng: 76.2673 });
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    useCurrentLocation();
  }, []);

  /* ================= SEARCH LOCATION ================= */
  const searchLocation = async () => {
    if (!locationInput.trim()) return;

    setLoading(true);

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${locationInput}`
      );

      if (res.data.length > 0) {
        setLocation({
          lat: parseFloat(res.data[0].lat),
          lng: parseFloat(res.data[0].lon)
        });
      } else {
        alert("Location not found");
      }

    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  /* ================= FETCH SERVICES ================= */
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/services");

        if (res.data?.success) {
          setServices(res.data.data);
        }

      } catch (err) {
        console.log("Fetch error:", err);
      }
    };

    loadServices();
  }, []);

  /* ================= DISTANCE ================= */
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  /* ================= NAVIGATION ================= */
  const openNavigation = (service) => {
    if (!location || !service?.location) return;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${service.location.lat},${service.location.lng}`;
    window.open(url, "_blank");
  };

  /* ================= AI FILTER ================= */
  useEffect(() => {

    if (!location || !services.length) return;

    const intent = detectIntent(search);

    const filtered = services
      .map((s) => {

        if (!s.location?.lat) return null;

        const distance = getDistance(
          location.lat,
          location.lng,
          s.location.lat,
          s.location.lng
        );

        return { ...s, distance };

      })
      .filter((s) => s && s.distance <= radius);

    const ranked = filtered.sort((a, b) => {

      const matchA =
        intent && a.category?.toLowerCase() === intent ? 50 : 0;

      const matchB =
        intent && b.category?.toLowerCase() === intent ? 50 : 0;

      const scoreA =
        matchA +
        (a.rating || 4) * 10 +
        (a.orders || 0) -
        a.distance * 4;

      const scoreB =
        matchB +
        (b.rating || 4) * 10 +
        (b.orders || 0) -
        b.distance * 4;

      return scoreB - scoreA;
    });

    setNearServices(ranked);
    setLoading(false);

  }, [location, services, radius, search]);

  /* ================= IMAGE ================= */
  const getImage = (img) => {
    if (!img) return "https://via.placeholder.com/400";
    if (img.startsWith("http")) return img;
    return `http://localhost:5000/${img}`;
  };

  /* ================= UI ================= */

  if (loading) {
    return <div className="loading">📍 Loading location...</div>;
  }

  return (
    <div className="near-container">

      <h1>📍 AI Nearby Services</h1>

      {/* LOCATION SEARCH */}
      <div className="location-box">
        <input
          placeholder="Enter location..."
          value={locationInput}
          onChange={(e)=>setLocationInput(e.target.value)}
        />

        <button onClick={searchLocation}>🔍</button>
        <button onClick={useCurrentLocation}>📍</button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search services..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
      />

      {/* RADIUS */}
      <select value={radius} onChange={(e)=>setRadius(Number(e.target.value))}>
        <option value={10}>10 km</option>
        <option value={20}>20 km</option>
        <option value={40}>40 km</option>
        <option value={60}>60 km</option>
        <option value={100}>100 km</option>
      </select>

      {/* GRID */}
      <div className="near-grid">

        {nearServices.length === 0 && <p>No services found</p>}

        {nearServices.map((s) => (
          <div key={s._id} className="near-card">

            <img src={getImage(s.images?.[0] || s.image)} alt="" />

            <h3>{s.name}</h3>
            <p>₹{s.price}</p>
            <p>⭐ {s.rating || 4.5}</p>

            <p>📍 {formatDistance(s.distance)}</p>

            <div>
              <button onClick={() => navigate(`/service/${s._id}`)}>
                View
              </button>

              <button onClick={() => openNavigation(s)}>
                Navigate
              </button>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}