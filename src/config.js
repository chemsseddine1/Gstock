const mongoose = require("mongoose");

// Connexion à MongoDB
mongoose
  .connect("mongodb://localhost:27017/Gstock", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Database connected successfully"))
  .catch(err => console.log("❌ Database connection failed:", err));

// ✅ Schéma pour stocker le dernier ID utilisé
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  seq: { type: Number, required: true },
});

const Counter = mongoose.model("Counter", counterSchema);

// ✅ Schéma des bons avec ID auto-incrémenté
const bonSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  typebon: { type: String, required: true },
  date: { type: String, required: true },
  tiers: { type: String, required: true },
  produits: [
    {
      idproduit: { type: Number, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true },
      sum: { type: Number, required: true },
    },
  ],
});

const Bon = mongoose.model("Bon", bonSchema);

// ✅ Fonction pour générer un nouvel ID
async function getNextSequence(name) {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// ✅ Schéma et modèle de l'utilisateur
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },

  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// ✅ Exporter les modèles
module.exports = { Bon, Counter, getNextSequence, User };
