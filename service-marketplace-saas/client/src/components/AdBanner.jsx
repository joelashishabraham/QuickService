import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdBanner(){

  const navigate = useNavigate();

  const [ads, setAds] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ADS ================= */
  useEffect(() => {
    const loadAds = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/services");

        if (res.data?.success && res.data.data?.length) {
          const adServices = res.data.data.filter(s => s.isAd === true);
          setAds(adServices);
        }

      } catch (err) {
        console.log("Ad fetch error:", err);
      }

      setLoading(false);
    };

    loadAds();
  }, []);

  /* ================= AUTO ROTATE ================= */
  useEffect(() => {
    if (!ads.length) return;

    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads]);

  const currentAd = ads[index];

  /* ================= IMAGE ================= */
  const getImage = (img) => {
    if (!img) return "https://via.placeholder.com/600x200";
    if (img.startsWith("http")) return img;
    return `http://localhost:5000/${img}`;
  };

  return (
    <div className="ad-banner">

      <div className="ad-content">

        <span className="ad-badge">🔥 Sponsored</span>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="ad-loading">
            <h2>Loading Ads...</h2>
          </div>
        )}

        {/* ================= ACTIVE AD ================= */}
        {!loading && currentAd && (
          <div key={currentAd._id} className="ad-slide">

            <h2 className="ad-title">{currentAd.name}</h2>

            <p className="ad-desc">
              {currentAd.description || "Top service near you"}
            </p>

            <img
              src={getImage(currentAd.images?.[0] || currentAd.image)}
              className="ad-image"
              alt="ad"
            />

            <div className="ad-buttons">

              <button
                className="primary-btn"
                onClick={() => navigate(`/service/${currentAd._id}`)}
              >
                View →
              </button>

              <button
                className="secondary-btn"
                onClick={() => navigate("/promote")}
              >
                Promote Yours
              </button>

            </div>

            <div className="ad-stats">
              <span>⭐ {currentAd.rating || 4.5}</span>
              <span>📍 {currentAd.city}</span>
              <span>₹ {currentAd.price}</span>
            </div>

          </div>
        )}

        {/* ================= EMPTY ================= */}
        {!loading && !currentAd && (
          <div className="ad-empty">

            <h2>Promote Your Service & Get Customers Fast</h2>

            <p>
              No ads available. Be the first to promote your service!
            </p>

            <button
              className="primary-btn"
              onClick={() => navigate("/promote")}
            >
              🚀 Promote Now
            </button>

          </div>
        )}

      </div>

    </div>
  );
}