import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Stock from "./Stock";

function Journal() {
  const navigate = useNavigate();
  const [bons, setBons] = useState([]);
  const [typebon, setTypebon] = useState("Bon Entrée");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tiers, setTiers] = useState("");
  const [editId, setEditId] = useState(null); // Pour suivre l'ID du bon en cours d'édition

  // 🔹 Récupérer les bons depuis le backend
  useEffect(() => {
    fetch("http://localhost:5000/bons")
      .then(res => res.json())
      .then(data => setBons(data))
      .catch(err => console.error("Erreur :", err));
  }, []);

  // 🔹 Ajouter ou modifier un bon dans MongoDB
  const handleSubmit = () => {
    const newBon = { typebon, date, tiers };

    if (editId) {
      // 🔹 Mode modification
      fetch(`http://localhost:5000/bons/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBon),
      })
        .then(res => res.json())
        .then(updatedBon => {
          setBons(bons.map(bon => (bon.id === editId ? updatedBon : bon)));
          setEditId(null);
        })
        .catch(err => console.error("Erreur :", err));
    } else {
      // 🔹 Mode ajout
      fetch("http://localhost:5000/bons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBon),
      })
        .then(res => res.json())
        .then(data => setBons([...bons, data]))
        .catch(err => console.error("Erreur :", err));
    }

    // Réinitialiser le formulaire
    setTypebon("Bon Entrée");
    setDate(new Date().toISOString().split("T")[0]);
    setTiers("");
  };

  // 🔹 Charger un bon existant pour modification
  const editBon = bon => {
    setEditId(bon.id);
    setTypebon(bon.typebon);
    setDate(bon.date);
    setTiers(bon.tiers);
  };

  // 🔹 Supprimer un bon
  const deleteBon = bonId => {
    fetch(`http://localhost:5000/bons/${bonId}`, { method: "DELETE" })
      .then(() => setBons(bons.filter(bon => bon.id !== bonId)))
      .catch(err => console.error("Erreur :", err));
  };

  return (
    <div className='container-fluid bg-2 text-center'>
      <h1>Journal Des Bons :</h1>

      {/* 🔹 Formulaire */}
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
            placeholder='Nom du tiers'
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

      {/* 🔹 Liste des bons */}
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
              <td>
                <button
                  className='btn btn-info me-2'
                  onClick={() =>
                    navigate(
                      `/inventory?id=${bon.id}&typebon=${bon.typebon}&date=${bon.date}&tiers=${bon.tiers}`
                    )
                  }
                >
                  Ajouter Produit
                </button>
                <button
                  className='btn btn-warning me-2'
                  onClick={() => editBon(bon)}
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
