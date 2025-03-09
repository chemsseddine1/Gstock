import React, { useState, useEffect } from "react";

function Stock() {
  const [bons, setBons] = useState([]);
  const [stock, setStock] = useState([]);

  // 🔹 Récupérer les bons depuis le backend
  useEffect(() => {
    fetch("http://localhost:5000/bons")
      .then(res => res.json())
      .then(data => {
        setBons(data);
        setStock(getStock(data)); // 🔹 Calcul du stock
      })
      .catch(err => console.error("Erreur :", err));
  }, []);

  // 🔹 Fonction pour calculer le stock
  const getStock = bons => {
    const stockMap = new Map();

    bons.forEach(bon => {
      bon.produits.forEach(prod => {
        const qty =
          bon.typebon === "Bon Sortie"
            ? -Math.abs(prod.qty)
            : Math.abs(prod.qty);
        // 🔹 Si Bon Sortie → on met la quantité négative
        // 🔹 Si Bon Entrée → quantité reste positive

        if (stockMap.has(prod.name)) {
          stockMap.set(prod.name, stockMap.get(prod.name) + qty);
        } else {
          stockMap.set(prod.name, qty);
        }
      });
    });

    return Array.from(stockMap, ([name, qty]) => ({ name, qty }));
  };

  return (
    <div className='container-fluid bg-2 text-center'>
      <h1 align='left'>Stock des Produits</h1>

      <button className='btn btn-primary' onClick={() => window.print()}>
        Imprimer le Stock
      </button>

      <table className='table table-bordered'>
        <thead>
          <br />
          <tr>
            <th>Nom du Produit</th>
            <th>QTY Disponible</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Stock;
