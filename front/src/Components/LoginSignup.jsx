import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css";

const API_URL = "http://localhost:5000";

const LoginSignup = () => {
  const [state, setState] = useState("Login"); // 🔄 Mode Login/Signup
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const navigate = useNavigate();

  const changeHandler = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async () => {
    const endpoint = state === "Login" ? "/login" : "/signup"; // 🔀 Choix API
    try {
      console.log(`🔹 Tentative de ${state.toLowerCase()}`, formData);

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Réponse de l'API :", data);

      if (data.success) {
        localStorage.setItem("auth-token", data.token); // ✅ Stocker le token

        if (data.success && data.name) {
          localStorage.setItem("username", data.name);
        } else {
          console.error("⚠️ Nom d'utilisateur non reçu :", data);
        }

        // ✅ Stocker le nom d'utilisateur
        navigate("/journal"); // 🔥 Rediriger après connexion
      } else {
        alert(
          `❌ Échec de la ${state.toLowerCase()} : ${
            data.message || "Erreur inconnue"
          }`
        );
      }
    } catch (error) {
      console.error("❌ Erreur :", error);
      alert("Erreur lors de l'authentification");
    }
  };

  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>{state}</h1>
        <div className='loginsignup-fields'>
          <input
            name='name'
            value={formData.name}
            onChange={changeHandler}
            type='text'
            placeholder='Nom'
          />
          <input
            name='password'
            value={formData.password}
            onChange={changeHandler}
            type='password'
            placeholder='Mot de passe'
          />
        </div>
        <button onClick={handleAuth}>
          {state === "Login" ? "Se connecter" : "S'inscrire"}
        </button>
        <p>
          {state === "Login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
          <span
            onClick={() => setState(state === "Login" ? "Signup" : "Login")}
          >
            {state === "Login" ? "Créer un compte" : "Se connecter"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginSignup;
