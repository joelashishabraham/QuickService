import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function FeaturedServices() {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/services");

        if (res.data?.success && res.data.data?.length) {
          const featured = res.data.data.filter((s) => s.premium === true);
          setServices(featured);
        }

      } catch (err) {
        console.log("Featured Error:", err);
      }

      setLoading(false);
    };

    fetchFeatured();
  }, []);

  /* ================= IMAGE ================= */
  const getImage = (img) => {
    if (!img) return "https://via.placeholder.com/400";
    if (img.startsWith("http")) return img;
    return `http://localhost:5000/${img}`;
  };

  /* ================= LOADING ================= */
  if (loading) {
    return <div className="loading">Loading Featured Services...</div>;
  }

  /* ================= EMPTY ================= */
  if (!services.length) {
    return <div className="empty">No Featured Services Available</div>;
  }

  /* ================= UI ================= */
  return (
    <div className="featured-container">

      <h1 className="title">⭐ Premium Featured Services</h1>

      <div className="featured-grid">

        {services.map((s) => {

          const score =
            (s.orders || 0) +
            (s.rating || 4) * 10 -
            (s.price || 0) / 50;

          return (
            <div
              key={s._id}
              className="featured-card"
              onClick={() => navigate(`/service/${s._id}`)}
            >

              {/* BADGE */}
              <div className="featured-badge">🔥 Premium</div>

              {/* IMAGE */}
              <img
                src={getImage(s.images?.[0] || s.image)}
                alt={s.name}
              />

              {/* CONTENT */}
              <div className="featured-content">

                <h3>{s.name}</h3>

                <p>₹{s.price}</p>

                <p>⭐ {s.rating || 4.5}</p>

                <p className="extra">
                  📍 {s.city} • 🧠 {score.toFixed(1)}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/service/${s._id}`);
                  }}
                >
                  View →
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}