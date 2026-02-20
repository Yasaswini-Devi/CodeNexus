import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function SharePage() {
  const { id } = useParams();
  const [code, setCode] = useState("Loading...");

  useEffect(() => {
    fetch(`http://localhost:5000/api/share/${id}`)
      .then(res => res.json())
      .then(data => setCode(data.code))
      .catch(() => setCode("Failed to load code"));
  }, [id]);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Shared Code</h2>
      <pre
        style={{
          background: "#111",
          color: "#00ff88",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        {code}
      </pre>
    </div>
  );
}
