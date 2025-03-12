const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Bon, getNextSequence, User } = require("./config");

const app = express();
const SECRET_KEY = "secret123"; // ⚠️ À remplacer par une variable d'environnement en production

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static("public"));

// ✅ Connexion à MongoDB

mongoose.connect("mongodb://localhost:27017/Gstock", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Routes d'authentification
app.post("/signup", async (req, res) => {
  try {
    console.log("🟢 Tentative d'inscription :", req.body);

    const existingUser = await User.findOne({ name: req.body.name });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Utilisateur déjà existant" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await User.create({
      name: req.body.name,
      password: hashedPassword,
    });

    console.log("✅ Utilisateur enregistré :", newUser);
    res.json({ success: true, message: "Inscription réussie", user: newUser });
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription :", error);
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de l'inscription", error });
  }
});

app.post("/login", async (req, res) => {
  try {
    console.log("🟢 Tentative de connexion :", req.body);

    const user = await User.findOne({ name: req.body.name });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Mot de passe incorrect" });
    }

    // ✅ Générer un token JWT
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({
      success: true,
      message: "Connexion réussie",
      token,
      name: user.name,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la connexion :", error);
    res
      .status(500)
      .json({ success: false, message: "Erreur de connexion", error });
  }
});

// ✅ Middleware d'authentification avec JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Accès non autorisé" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token invalide" });
  }
};

// ✅ API REST pour la gestion des bons (protégé par JWT)
app.post("/bons", authMiddleware, async (req, res) => {
  try {
    const { typebon, date, tiers } = req.body;
    const newId = await getNextSequence("bonId");

    const newBon = new Bon({
      id: newId,
      typebon,
      date,
      tiers,
      produits: [],
    });

    await newBon.save();
    res.status(201).json(newBon);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout du bon", error });
  }
});

app.get("/bons", authMiddleware, async (req, res) => {
  try {
    const bons = await Bon.find();
    res.json(bons);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des bons", error });
  }
});

app.get("/bons/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const bon = await Bon.findOne({ id: Number(id) });
    if (!bon) return res.status(404).json({ message: "Bon non trouvé" });
    res.json(bon);
  } catch (error) {
    res.status(500).json({ message: "Erreur interne du serveur", error });
  }
});

app.post("/bons/:id/produits", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, qty } = req.body;
    const sum = price * qty;

    const bon = await Bon.findOneAndUpdate(
      { id: Number(id) },
      { $push: { produits: { idproduit: Number(id), name, price, qty, sum } } },
      { new: true }
    );

    if (!bon) return res.status(404).json({ message: "Bon non trouvé" });
    res.json(bon);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout du produit", error });
  }
});

app.put("/bons/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { typebon, date, tiers } = req.body;
    const updatedBon = await Bon.findOneAndUpdate(
      { id: Number(id) },
      { typebon, date, tiers },
      { new: true }
    );
    res.json(updatedBon);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du bon" });
  }
});

app.delete("/bons/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await Bon.findOneAndDelete({ id: Number(id) });
    res.json({ message: "Bon supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression du bon" });
  }
});

// ✅ Lancer le serveur
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`)
);
