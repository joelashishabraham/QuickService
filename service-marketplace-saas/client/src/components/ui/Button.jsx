export default function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 18px",
        borderRadius: "20px",
        background: "#2563eb",
        color: "white",
        border: "none",
        cursor: "pointer"
      }}
    >
      {children}
    </button>
  );
}