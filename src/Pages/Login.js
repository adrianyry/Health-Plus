import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../Styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Autentificare reușită!");
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        toast.error(data.message || "Eroare la autentificare!");
      }
    } catch (error) {
      toast.error("Eroare de conexiune cu serverul!");
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: "400px", margin: "80px auto", padding: "20px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "8px" }}>
      <h2>Autentificare</h2>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Parolă:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px", backgroundColor: "#1A8EFD", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Intră în cont
        </button>
      </form>
      <p style={{ marginTop: "15px", textAlign: "center" }}>
        <Link to="/">Înapoi la pagina principală</Link>
      </p>
    </div>
  );
}

export default Login;
