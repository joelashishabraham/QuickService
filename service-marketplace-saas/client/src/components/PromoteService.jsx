import { useEffect, useState } from "react";
import axios from "axios";

export default function PromoteService() {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= FETCH USER SERVICES ================= */
  useEffect(() => {

    const loadServices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/services");

        if (res.data?.success && user) {

          const myServices = res.data.data.filter((s) => {

            const providerId =
              typeof s.provider === "object"
                ? s.provider._id
                : s.provider;

            const userId = user._id || user.id;

            return String(providerId) === String(userId);
          });

          setServices(myServices);
        }

      } catch (err) {
        console.log("Error loading services:", err);
      }

      setLoading(false);
    };

    loadServices();

  }, [user]);

  /* ================= PROMOTE SERVICE ================= */
  const promote = async (id) => {
    try {

      await axios.put(
        `http://localhost:5000/api/services/${id}/promote`
      );

      // update UI instantly
      setServices((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, isAd: true } : s
        )
      );

      showNotification("🚀 Service promoted successfully!");

    } catch (err) {
      console.log("Promote error:", err);
    }
  };

  /* ================= IMAGE ================= */
  const getImage = (img) => {
    if (!img) return "https://via.placeholder.com/300";
    if (img.startsWith("http")) return img;
    return `http://localhost:5000/${img}`;
  };

  /* ================= LOADING ================= */
  if (loading) {
    return <div className="loading">Loading your services...</div>;
  }

  /* ================= EMPTY ================= */
  if (!services.length) {
    return (
      <div className="empty">
        ❌ No services found.<br />
        👉 Create a service first.
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="promote-container">

      <h1 className="title">🚀 Promote Your Services</h1>

      <div className="promote-grid">

        {services.map((s) => (

          <div key={s._id} className="promote-card">

            <img
              src={getImage(s.images?.[0] || s.image)}
              alt={s.name}
            />

            <div className="promote-content">

              <h3>{s.name}</h3>

              <p>₹{s.price}</p>

              <p>📍 {s.city}</p>

              {/* STATUS */}
              {s.isAd ? (
                <span className="active">
                  🔥 Already Promoted
                </span>
              ) : (
                <button onClick={() => promote(s._id)}>
                  Promote Now
                </button>
              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}