const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cors = require("cors");
//const User = require("./models/User"); // Import du modèle User
const { Bon, getNextSequence, User } = require("./config");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static("public"));

// ✅ Connexion à MongoDB
mongoose
  .connect("mongodb://localhost:27017/Gstock", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.error("❌ Erreur de connexion MongoDB :", err));

// ✅ Routes de l'authentification
app.get("/", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));

app.post("/signup", async (req, res) => {
  try {
    const existingUser = await User.findOne({ name: req.body.username });
    if (existingUser) return res.status(400).send("Utilisateur déjà existant");

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userdata = await User.create({
      name: req.body.username,
      password: hashedPassword,
    });

    console.log("✅ Utilisateur enregistré :", userdata);
    res.redirect("/");
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription :", error);
    res.status(500).send("Erreur lors de l'inscription");
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ name: req.body.username });
    if (!user) return res.status(400).send("Utilisateur non trouvé");

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (isMatch) {
      res.render("home");
    } else {
      res.status(400).send("Mot de passe incorrect");
    }
  } catch (error) {
    console.error("❌ Erreur lors de la connexion :", error);
    res.status(500).send("Erreur de connexion");
  }
});

// ✅ API REST pour la gestion des bons
app.post("/bons", async (req, res) => {
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

app.get("/bons", async (req, res) => {
  try {
    const bons = await Bon.find();
    res.json(bons);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des bons", error });
  }
});

app.get("/bons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bon = await Bon.findOne({ id: Number(id) });
    if (!bon) return res.status(404).json({ message: "Bon non trouvé" });
    res.json(bon);
  } catch (error) {
    res.status(500).json({ message: "Erreur interne du serveur", error });
  }
});

app.post("/bons/:id/produits", async (req, res) => {
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

app.put("/bons/:id", async (req, res) => {
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

app.delete("/bons/:id", async (req, res) => {
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
