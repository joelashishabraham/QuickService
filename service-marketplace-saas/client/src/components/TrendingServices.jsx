import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function TrendingServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTrending();
  }, []);

  /* ================= FETCH ================= */
  const fetchTrending = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/services");

      if (res.data?.success && res.data.data?.length > 0) {
        const data = [...res.data.data];

        const sorted = data.sort((a, b) => {
          const scoreA =
            (a.orders || a.bookings || 0) +
            (a.rating || 4) * 10 -
            (a.price || 0) / 50;

          const scoreB =
            (b.orders || b.bookings || 0) +
            (b.rating || 4) * 10 -
            (b.price || 0) / 50;

          return scoreB - scoreA;
        });

        setServices(sorted.slice(0, 6));
      }
    } catch (err) {
      console.log("Trending Error:", err);
    }

    setLoading(false);
  };

  /* ================= IMAGE ================= */
  const getImage = (img) => {
    if (!img) return "https://via.placeholder.com/300";
    if (img.startsWith("http")) return img;
    return `http://localhost:5000/${img}`;
  };

  /* ================= LOADING ================= */
  if (loading) {
    return <h2>Loading trending services...</h2>;
  }

  return (
    <div className="trending-container">

      <h2 className="title">🔥 Trending Services</h2>

      <div className="trending-grid">
        {services.map((s, index) => {

          const score =
            (s.orders || 0) +
            (s.rating || 4) * 10 -
            (s.price || 0) / 50;

          return (
            <motion.div
              key={s._id}
              className="flip-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >

              <div className="flip-inner">

                {/* FRONT */}
                <div className="flip-front">

                  <div className="badge">🔥 Trending</div>

                  <img src={getImage(s.images?.[0] || s.image)} />

                  <h3>{s.name}</h3>

                  <p className="price">₹{s.price}</p>

                  <p className="rating">⭐ {s.rating || 4.5}</p>

                </div>

                {/* BACK */}
                <div className="flip-back">

                  <h3>{s.name}</h3>

                  <p>{s.description || "Top rated service provider"}</p>

                  <p>📍 {s.city}</p>

                  <p>📊 Orders: {s.orders || 0}</p>

                  <p>🧠 AI Score: {score.toFixed(1)}</p>

                  <button onClick={() => navigate(`/service/${s._id}`)}>
                    View Details →
                  </button>

                </div>

              </div>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
}