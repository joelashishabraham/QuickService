import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapSearch() {
  return (
    <div style={{ height: "500px", margin: 40 }}>
      <MapContainer center={[9.9312, 76.2673]} zoom={13} style={{ height: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[9.9312, 76.2673]}>
          <Popup>Service Provider</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}