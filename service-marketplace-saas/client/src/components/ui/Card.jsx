export default function Card({ children }) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "20px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
        background: "#fff"
      }}
    >
      {children}
    </div>
  );
}