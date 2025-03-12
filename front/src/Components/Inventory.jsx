import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Inventory() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const id = queryParams.get("id");
  const typebon = queryParams.get("typebon");
  const date = queryParams.get("date");
  const tiers = queryParams.get("tiers");

  const [idproduit, setIdproduit] = useState(id || "");
  const [price, setPrice] = useState(0);
  const [qty, setQty] = useState(0);
  const [sum, setSum] = useState(0);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      console.error("⚠️ Aucun token trouvé. Redirection vers login.");
      navigate("/");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/bons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors de la récupération du bon");

      const data = await res.json();
      console.log("📦 Produits récupérés :", data.produits);
      setUsers(data.produits || []);
    } catch (err) {
      console.error("❌ Erreur :", err);
    }
  };

  useEffect(() => {
    if (id) fetchProducts();
  }, [id, navigate]);

  useEffect(() => {
    const newTotal = users.reduce(
      (acc, product) => acc + (product.sum || 0),
      0
    );
    setTotal(newTotal);
    console.log("💰 Total mis à jour :", newTotal);
  }, [users]);

  const addProductToBon = async () => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      console.error("⚠️ Aucun token trouvé. Redirection vers login.");
      navigate("/login");
      return;
    }

    const newProduct = { idproduit, name, price, qty, sum };
    try {
      const res = await fetch(`http://localhost:5000/bons/${id}/produits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) throw new Error("Erreur lors de l'ajout du produit");

      const data = await res.json();
      console.log("✅ Produit ajouté :", data);

      // Rafraîchir la liste après l'ajout
      fetchProducts();

      // Réinitialisation des champs après l'ajout
      setName("");
      setQty(0);
      setPrice(0);
      setSum(0);
    } catch (err) {
      console.error("❌ Erreur :", err);
    }
  };

  const handlePriceChange = e => {
    const newPrice = parseFloat(e.target.value) || 0;
    setPrice(newPrice);
    setSum(newPrice * qty);
  };

  const handleQuantityChange = e => {
    let newQuantity = parseInt(e.target.value) || 0;
    if (typebon === "Bon Sortie") newQuantity = -Math.abs(newQuantity);
    setQty(newQuantity);
    setSum(price * newQuantity);
  };

  const handleConsultStock = () => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      console.error("⚠️ Aucun token trouvé. Redirection vers login.");
      navigate("/login");
      return;
    }

    navigate("/stock"); // Redirection vers la page stock
  };

  return (
    <div className='container-fluid bg-2 text-center'>
      <h1>📦 Détail du Bon</h1>
      <p>
        <strong>Id Bon:</strong> {id}
      </p>
      <p>
        <strong>Type Bon:</strong> {typebon}
      </p>
      <p>
        <strong>Date:</strong> {date}
      </p>
      <p>
        <strong>Tiers:</strong> {tiers}
      </p>
      <br />
      <div className='row'>
        <div className='col-sm-8'>
          <h2 align='left'>Ajouter des Produits</h2>
          <table className='table table-bordered'>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Nom</th>
                <th>Prix</th>
                <th>Quantité</th>
                <th>Total</th>
                <th>Option</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    type='text'
                    className='form-control'
                    value={idproduit}
                    disabled
                  />
                </td>
                <td>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Nom du produit'
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type='number'
                    className='form-control'
                    placeholder='Prix'
                    value={price}
                    onChange={handlePriceChange}
                  />
                </td>
                <td>
                  <input
                    type='number'
                    className='form-control'
                    placeholder='Quantité'
                    value={qty}
                    onChange={handleQuantityChange}
                  />
                </td>
                <td>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Total'
                    value={sum}
                    disabled
                  />
                </td>
                <td>
                  <button className='btn btn-success' onClick={addProductToBon}>
                    Ajouter
                  </button>
                </td>
                <td>
                  {" "}
                  <button
                    className='btn btn-success'
                    onClick={handleConsultStock}
                  >
                    Consulter Stock
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <h3 align='left'>Produits</h3>
          <table className='table table-bordered'>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Nom</th>
                <th>Prix</th>
                <th>Quantité</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row, index) => (
                <tr key={index}>
                  <td>{row.idproduit}</td>
                  <td>{row.name}</td>
                  <td>{row.price}</td>
                  <td>{row.qty}</td>
                  <td>{row.sum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='col-sm-4'>
          <h3>Total</h3>
          <input
            type='text'
            className='form-control'
            placeholder='Total'
            value={total}
            disabled
          />
        </div>
      </div>
    </div>
  );
}

export default Inventory;
