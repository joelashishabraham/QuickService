import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "../components/ui/Card";

export default function Providers() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    api.get("/api/providers").then(res => setProviders(res.data));
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>Providers</h2>

      {providers.map(p => (
        <Card key={p._id}>
          <h3>{p.name}</h3>
          <p>{p.city}</p>
          <p>{p.phone}</p>
        </Card>
      ))}
    </div>
  );
}