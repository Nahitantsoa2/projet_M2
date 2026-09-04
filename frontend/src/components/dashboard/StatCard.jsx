export default function StatCard({
  title,
  value,
  color = "#2563eb",
}) {
  return (
    <div
      style={{
        background: color,
        borderRadius: "16px",
        padding: "24px",
        color: "#fff",
        boxShadow: "0 10px 20px rgba(0,0,0,.15)",
        transition: ".3s",
      }}
    >
      <p
        style={{
          opacity: ".8",
          fontSize: "14px",
          marginBottom: "10px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          fontSize: "34px",
          fontWeight: "700",
          margin: 0,
        }}
      >
        {value}
      </h2>
    </div>
  );
}