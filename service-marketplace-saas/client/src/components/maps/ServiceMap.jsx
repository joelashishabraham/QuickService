import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function ServiceMap({ providers }) {
  return (
    <MapContainer center={[10.8505, 76.2711]} zoom={7} style={{ height: "400px" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {providers.map((p) => (
        <Marker
          key={p._id}
          position={[
            p.location.coordinates[1],
            p.location.coordinates[0]
          ]}
        >
          <Popup>
            {p.name} <br /> ₹{p.price}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}