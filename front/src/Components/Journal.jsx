import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Global.css";

function Journal() {
  const navigate = useNavigate();
  const [bons, setBons] = useState([]);
  const [typebon, setTypebon] = useState("Bon Entrée");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tiers, setTiers] = useState("");
  const [editId, setEditId] = useState(null);
  const [username, setUsername] = useState(""); // ✅ État pour le nom d'utilisateur

  // ✅ Fonction pour récupérer le token
  const getToken = () => localStorage.getItem("auth-token");

  // ✅ Récupérer le nom d'utilisateur
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // ✅ Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("username");
    navigate("/");
  };

  // ✅ Vérifier le token et récupérer les bons
  useEffect(() => {
    const fetchBons = async () => {
      const token = getToken();
      if (!token) {
        console.error("⚠️ Aucun token trouvé. Redirection vers login.");
        navigate("/");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/bons", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          console.error("⚠️ Token invalide ou expiré. Redirection vers login.");
          localStorage.removeItem("auth-token");
          navigate("/");
          return;
        }

        if (!response.ok) throw new Error("❌ Erreur de récupération des bons");

        const data = await response.json();
        setBons(data);
      } catch (error) {
        console.error("Erreur :", error);
      }
    };

    fetchBons();
  }, [navigate]);

  // ✅ Ajouter ou modifier un bon
  const handleSubmit = async () => {
    const token = getToken();
    if (!token) {
      console.error("⚠️ Aucun token trouvé. Redirection vers login.");
      navigate("/");
      return;
    }

    const newBon = { typebon, date, tiers };
    const url = editId
      ? `http://localhost:5000/bons/${editId}`
      : "http://localhost:5000/bons";
    const method = editId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBon),
      });

      if (response.status === 401) {
        localStorage.removeItem("auth-token");
        navigate("/");
        return;
      }

      const data = await response.json();
      if (editId) {
        setBons(bons.map(bon => (bon.id === editId ? data : bon)));
        setEditId(null);
      } else {
        setBons([...bons, data]);
      }
    } catch (error) {
      console.error("Erreur :", error);
    }

    setTypebon("Bon Entrée");
    setDate(new Date().toISOString().split("T")[0]);
    setTiers("");
  };

  // ✅ Supprimer un bon
  const deleteBon = async bonId => {
    const token = getToken();
    if (!token) {
      console.error("⚠️ Aucun token trouvé. Redirection vers login.");
      navigate("/");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/bons/${bonId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("auth-token");
        navigate("/");
        return;
      }

      setBons(bons.filter(bon => bon.id !== bonId));
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  // ✅ Fonction pour aller vers l'ajout de produit (Inventaire)
  const goToInventory = bon => {
    navigate(
      `/inventory?id=${bon.id}&typebon=${bon.typebon}&date=${bon.date}&tiers=${bon.tiers}`
    );
  };

  return (
    <div className='container-fluid bg-2 text-center'>
      {/* ✅ En-tête avec nom et bouton de déconnexion */}
      <div className='d-flex justify-content-between align-items-center p-3 bg-light'>
        <h2 className='m-0'>📜 Journal des Bons</h2>
        <div className='d-flex align-items-center'>
          <span className='me-3'>👤 {username}</span>
          <button className='btn btn-danger' onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* ✅ Formulaire pour ajouter/modifier un bon */}
      <div className='row mb-3'>
        <div className='col-md-3'>
          <label>Type de Bon :</label>
          <select
            className='form-control'
            value={typebon}
            onChange={e => setTypebon(e.target.value)}
          >
            <option value='Bon Entrée'>Bon Entrée</option>
            <option value='Bon Sortie'>Bon Sortie</option>
          </select>
        </div>

        <div className='col-md-3'>
          <label>Date :</label>
          <input
            type='date'
            className='form-control'
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div className='col-md-3'>
          <label>Tiers :</label>
          <input
            type='text'
            className='form-control'
            value={tiers}
            onChange={e => setTiers(e.target.value)}
          />
        </div>

        <div className='col-md-3 d-flex align-items-end'>
          <button className='btn btn-success w-100' onClick={handleSubmit}>
            {editId ? "Modifier le Bon" : "Ajouter un Bon"}
          </button>
        </div>
      </div>

      {/* ✅ Liste des Bons */}
      <h3 align='left'>Liste des Bons</h3>
      <table className='table table-bordered'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type Bon</th>
            <th>Date</th>
            <th>Tiers</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bons.map((bon, index) => (
            <tr key={index}>
              <td>{bon.id}</td>
              <td>{bon.typebon}</td>
              <td>{bon.date}</td>
              <td>{bon.tiers}</td>
              <td className='d-flex justify-content-center gap-2'>
                <button
                  className='btn btn-info'
                  onClick={() => goToInventory(bon)}
                >
                  Ajouter Produit
                </button>
                <button
                  className='btn btn-warning'
                  onClick={() => setEditId(bon.id)}
                >
                  Modifier
                </button>
                <button
                  className='btn btn-danger'
                  onClick={() => deleteBon(bon.id)}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Journal;
