import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function Inventory() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const id = queryParams.get("id");
  const typebon = queryParams.get("typebon");
  const date = queryParams.get("date");
  const tiers = queryParams.get("tiers");

  const [idproduit, setIdproduit] = useState(id || ""); // Correction
  const [price, setPrice] = useState(0);
  const [qty, setQty] = useState(0);
  const [sum, setSum] = useState(0);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [total, setTotal] = useState(0);

  // Effet pour récupérer la liste des produits du bon
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`http://localhost:5000/bons/${id}`);
        if (!res.ok) throw new Error("Erreur lors de la récupération du bon");

        const data = await res.json();
        setUsers(data.produits || []); // Met à jour la liste des produits
      } catch (err) {
        console.error("Erreur :", err);
      }
    };

    if (id) {
      fetchProducts();
    }
  }, [id]);

  useEffect(() => {
    const newTotal = users.reduce((acc, product) => acc + product.sum, 0);
    setTotal(newTotal);
  }, [users]);

  // Mettre à jour idproduit si id change
  useEffect(() => {
    setIdproduit(id || "");
  }, [id]);

  const calculation = () => {
    const newUser = { name, idproduit, qty, price, sum };
    setUsers(prevUsers => [...prevUsers, newUser]);

    // Mise à jour du total
    setTotal(prevTotal => prevTotal + sum);

    // Clear inputs
    setName("");
    setQty(0);
    setPrice(0);
    setSum(0);
  };

  const addProductToBon = async () => {
    const newProduct = { name, price, qty, sum };

    try {
      const res = await fetch(`http://localhost:5000/bons/${id}/produits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) throw new Error("Erreur lors de l'ajout du produit");

      const data = await res.json();
      setUsers(prevUsers => [...prevUsers, data]);
      window.location.reload();
      // Met à jour l'affichage

      // Reset des champs
      setName("");
      setQty(0);
      setPrice(0);
      setSum(0);
    } catch (err) {
      console.error("Erreur :", err);
    }
  };

  const handlePricechange = e => {
    const newPrice = parseFloat(e.target.value) || 0;
    setPrice(newPrice);
    setSum(newPrice * qty);
  };

  const handleQuantitychange = e => {
    let newQuantity = parseInt(e.target.value) || 0;

    // Si c'est un Bon Sortie, multiplier par -1
    if (typebon === "Bon Sortie") {
      newQuantity = -Math.abs(newQuantity);
    }

    setQty(newQuantity);
    setSum(price * newQuantity);
  };

  function refreshPage() {
    window.location.reload();
  }

  return (
    <div className='container-fluid bg-2 text-center'>
      <h1>Detail De Bon </h1>

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
          <h2 align='left'>Ajouter Les Produits</h2>
          <table className='table table-bordered'>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Amount</th>
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
                    placeholder='Item Name'
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type='number'
                    className='form-control'
                    placeholder='Enter Price'
                    value={price}
                    onChange={handlePricechange}
                  />
                </td>
                <td>
                  <input
                    type='number'
                    className='form-control'
                    placeholder='Enter Qty'
                    value={qty}
                    onChange={handleQuantitychange}
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
                  <button
                    className='btn btn-success'
                    type='button'
                    onClick={addProductToBon}
                  >
                    Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <h3 align='left'>Products</h3>
          <table className='table table-bordered'>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Item Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Amount</th>
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
          <div className='form-group' align='left'>
            <h3>Total</h3>
            <input
              type='text'
              className='form-control'
              placeholder='Enter total'
              value={total}
              disabled
            />
            <br />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
