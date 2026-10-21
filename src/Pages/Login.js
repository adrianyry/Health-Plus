cat << 'EOF' > src/Pages/Login.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../Styles/Login.css"; // Opțional, poți folosi stilurile existente

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Bun venit, ${data.user.name}!`);
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        toast.error(data.message || "Eroare la autentificare");
      }
    } catch (err) {
      toast.error("Eroare de conexiune cu serverul.");
    }
  };

  return (
    <div className="login-section" style={{ padding: "120px 20px", textAlign: "center" }}>
      <h2>Autentificare Doctor / Admin</h2>
      <form onSubmit={handleLogin} style={{ maxWidth: "400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <input
          type="password"
          placeholder="Parolă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <button type="submit" className="text-appointment-btn" style={{ padding: "10px", cursor: "pointer" }}>
          Intră în cont
        </button>
      </form>
      <p style={{ marginTop: "15px" }}>
        <Link to="/">Înapoi la pagina principală</Link>
      </p>
    </div>
  );
}

export default Login;
EOF
