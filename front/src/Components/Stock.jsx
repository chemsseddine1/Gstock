import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function Stock() {
  const [bons, setBons] = useState([]);
  const [stock, setStock] = useState([]);

  useEffect(() => {
    const fetchStock = async () => {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        console.error("⚠️ Aucun token trouvé. Redirection vers login.");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/bons", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erreur lors de la récupération des bons");

        const data = await res.json();
        setBons(data);
        setStock(getStock(data));
      } catch (err) {
        console.error("❌ Erreur :", err);
      }
    };

    fetchStock();
  }, []);

  useEffect(() => {
    if (bons.length > 0) {
      setStock(getStock(bons));
    }
  }, [bons]);

  const getStock = bons => {
    const stockMap = new Map();

    bons.forEach(bon => {
      bon.produits.forEach(prod => {
        const qty =
          bon.typebon === "Bon Sortie"
            ? -Math.abs(prod.qty)
            : Math.abs(prod.qty);

        if (stockMap.has(prod.name)) {
          stockMap.set(prod.name, stockMap.get(prod.name) + qty);
        } else {
          stockMap.set(prod.name, qty);
        }
      });
    });

    return Array.from(stockMap, ([name, qty]) => ({ name, qty }));
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Stock des Produits", 20, 20);

    // Ajouter le tableau
    autoTable(doc, {
      startY: 30,
      head: [["Nom du Produit", "QTY Disponible"]],
      body: stock.map(item => [item.name, item.qty]), // Convertir les données pour le tableau
    });

    doc.save("stock.pdf");
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
          {stock
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.qty}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <button className='btn btn-success' onClick={handleDownloadPDF}>
        Télécharger PDF
      </button>
    </div>
  );
}

export default Stock;
