import { useState, useEffect, useRef } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function SearchBox() {

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState([]);
  const [focused, setFocused] = useState(false);

  const [sort, setSort] = useState("");
  const [rating, setRating] = useState("");

  const navigate = useNavigate();
  const boxRef = useRef();

  /* ================= LOAD RECENT ================= */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentSearch")) || [];
    setRecent(saved);
  }, []);

  /* ================= SAVE RECENT ================= */
  const saveRecent = (text) => {
    const updated = [text, ...recent.filter(r => r !== text)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem("recentSearch", JSON.stringify(updated));
  };

  /* ================= AI SERVICE MATCH ================= */
  const aiSearch = (text) => {
    const t = text.toLowerCase();

    if (t.includes("ac")) return "AC Repair";
    if (t.includes("clean")) return "Cleaning";
    if (t.includes("water") || t.includes("pipe")) return "Plumbing";
    if (t.includes("electric")) return "Electrician";

    return text;
  };

  /* ================= PARSE CITY ================= */
  const parseSearch = (text) => {
    const words = text.toLowerCase().split(" ");

    const cities = [
      "kochi", "trivandrum", "kottayam",
      "calicut", "malappuram", "kannur"
    ];

    let detectedCity = "";
    let serviceText = text;

    words.forEach(word => {
      if (cities.includes(word)) {
        detectedCity = word;
        serviceText = text.replace(new RegExp(word, "i"), "").trim();
      }
    });

    return {
      search: serviceText,
      city: detectedCity
    };
  };

  /* ================= LIVE SEARCH ================= */
  useEffect(() => {
    const delay = setTimeout(async () => {

      if (!search.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);

      try {
        const parsed = parseSearch(search);
        const smart = aiSearch(parsed.search);

        const res = await API.get(
          `/api/search?search=${smart}&city=${parsed.city}&sort=${sort}&rating=${rating}`
        );

        setResults(res.data.data || []);

      } catch (err) {
        console.log(err);
      }

      setLoading(false);

    }, 300);

    return () => clearTimeout(delay);

  }, [search, sort, rating]);

  /* ================= SELECT ================= */
  const handleSelect = (service) => {
    saveRecent(search);
    navigate(`/service/${service._id}`);
    setSearch("");
    setResults([]);
    setFocused(false);
  };

  /* ================= KEYBOARD ================= */
  const handleKey = (e) => {
    if (e.key === "ArrowDown") {
      setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
    }

    if (e.key === "ArrowUp") {
      setActiveIndex(prev => Math.max(prev - 1, 0));
    }

    if (e.key === "Enter" && results[activeIndex]) {
      handleSelect(results[activeIndex]);
    }
  };

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClick = (e) => {
      if (!boxRef.current?.contains(e.target)) {
        setFocused(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="searchbox" ref={boxRef}>

      {/* INPUT */}
      <div className="searchbox-inputs">

        <input
          placeholder="🔍 Search (e.g. cleaning kochi)"
          value={search}
          onFocus={() => setFocused(true)}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKey}
        />

        {search && (
          <button onClick={() => setSearch("")}>✕</button>
        )}

      </div>

      {/* DETECTED CITY */}
      {search && (
        <p className="searchbox-detected">
          📍 {parseSearch(search).city || "All locations"}
        </p>
      )}

      {/* FILTERS */}
      <div className="searchbox-filters">
        <select onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort</option>
          <option value="low">Price Low</option>
          <option value="high">Price High</option>
        </select>

        <select onChange={(e) => setRating(e.target.value)}>
          <option value="">Rating</option>
          <option value="4">4★+</option>
          <option value="3">3★+</option>
        </select>
      </div>

      {/* DROPDOWN */}
      {focused && (
        <div className="searchbox-dropdown">

          {loading && <div className="searchbox-item">Loading...</div>}

          {/* RESULTS */}
          {!loading && search && results.length > 0 && (
            <>
              <div className="searchbox-title">Results</div>
              {results.map((item, i) => (
                <div
                  key={item._id}
                  className={`searchbox-item ${i === activeIndex ? "active" : ""}`}
                  onClick={() => handleSelect(item)}
                >
                  🔧 {item.name} - {item.city}
                </div>
              ))}
            </>
          )}

          {/* NO RESULT */}
          {!loading && search && results.length === 0 && (
            <div className="searchbox-item">No results found</div>
          )}

          {/* TRENDING */}
          {!search && (
            <>
              <div className="searchbox-title">🔥 Trending</div>
              {["Cleaning", "AC Repair", "Plumbing"].map((t, i) => (
                <div
                  key={i}
                  className="searchbox-item"
                  onClick={() => setSearch(t)}
                >
                  🔥 {t}
                </div>
              ))}
            </>
          )}

          {/* RECENT */}
          {!search && recent.length > 0 && (
            <>
              <div className="searchbox-title">🕘 Recent</div>
              {recent.map((r, i) => (
                <div
                  key={i}
                  className="searchbox-item"
                  onClick={() => setSearch(r)}
                >
                  {r}
                </div>
              ))}
            </>
          )}

        </div>
      )}

    </div>
  );
}