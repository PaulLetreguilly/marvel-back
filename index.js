const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
require("dotenv").config();

const app = express();

const Character = require("./models/Character");
const Comic = require("./models/Comic");
const User = require("./models/User");
const isAuthenticated = require("./middleware/middleware");

app.use(formidable());
app.use(cors());
mongoose.connect(process.env.MONGODB_URI);

app.get("/", (req, res) => {
  res.send("Welcome to my marvel api");
});

app.get("/characters", async (req, res) => {
  try {
    //req.originUrl
    let params = { apiKey: "bNK7btJOXDqp7a9P" };
    if (req.query.name) {
      params.name = req.query.name;
    }
    let page = 1;
    if (Number(req.query.page) > 1) {
      page = Number(req.query.page);
    }
    let limit = 100;
    if (req.query.limit) {
      limit = Number(req.query.limit);
    }
    params.limit = limit;
    params.skip = limit * (page - 1);

    const response = await axios.get(
      "https://lereacteur-marvel-api.herokuapp.com/characters",
      { params }
    );
    // console.log(response.data);
    // console.log(params);
    res.status(200).json(response.data);

    // const search = response.data.results.find(filter).limit(5);
    // res.status(200).json(search);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/comics", async (req, res) => {
  try {
    let params = { apiKey: "bNK7btJOXDqp7a9P" };
    if (req.query.title) {
      params.title = req.query.title;
    }
    let page = 1;
    // console.log(req.query.page);
    if (Number(req.query.page) > 1) {
      page = Number(req.query.page);
    }
    let limit = 100;
    if (req.query.limit) {
      limit = Number(req.query.limit);
    }
    params.limit = limit;
    params.skip = limit * (page - 1);

    const response = await axios.get(
      "https://lereacteur-marvel-api.herokuapp.com/comics",
      { params }
    );
    res.status(200).json(response.data);
    // console.log(params);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/comics/:id", async (req, res) => {
  try {
    // console.log(req.params.id);
    // console.log('')
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics/${req.params.id}/?apiKey=bNK7btJOXDqp7a9P`
    );
    // console.log(response.data.id);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// -------------------- CRUD START -------------------- //

// **Create**

app.post("/favorite/character", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.fields.favorite);
    // console.log(req.headers.authorization);
    const ownerToken = req.headers.authorization.replace("Bearer ", "");
    // console.log(ownerToken);
    const character = new Character({
      ownerToken: ownerToken,
      favorite: req.fields.favorite,
    });
    await character.save();
    // console.log(character);
    res.json({ message: "favorite registered" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.post("/favorite/comic", isAuthenticated, async (req, res) => {
  try {
    console.log(req.fields.favorite);
    console.log(req.headers.authorization);
    const ownerToken = req.headers.authorization.replace("Bearer ", "");
    // console.log(ownerToken);
    const comic = new Comic({
      ownerToken: ownerToken,
      favorite: req.fields.favorite,
    });
    await comic.save();
    // console.log(character);
    res.json({ message: "favorite registered" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// **Read**

app.get("/favorite/character", isAuthenticated, async (req, res) => {
  try {
    console.log(req.headers.authorization);
    const filter = {
      ownerToken: req.headers.authorization.replace("Bearer ", ""),
    };
    const favorites = await Character.find(filter);
    console.log(favorites);
    res.status(200).json(favorites);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.get("/favorite/comic", isAuthenticated, async (req, res) => {
  try {
    console.log(req.headers.authorization);
    const filter = {
      ownerToken: req.headers.authorization.replace("Bearer ", ""),
    };
    const favorites = await Comic.find(filter);
    console.log(favorites);
    res.status(200).json(favorites);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// **Delete**
app.post("/character/delete", async (req, res) => {
  try {
    console.log(req.fields.id);
    if (req.fields.id) {
      // si l'id a bien été transmis
      const id = req.fields.id;
      // On recherche le "student" à modifier à partir de son id et on le supprime :
      await Character.findByIdAndDelete(id);

      // On répond au client :
      res.json({ message: "Favorite removed" });
    } else {
      // si aucun id n'a été transmis :
      res.status(400).json({ message: "Missing id" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// -------------------- CRUD END -------------------- //

// -------------------- log-sign routes START -------------------- //

app.post("/signup", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });

    if (user) {
      res.status(409).json({ message: "This email already has an account" });
    } else {
      if (req.fields.email && req.fields.password && req.fields.username) {
        const token = uid2(64);
        const salt = uid2(64);
        const hash = SHA256(req.fields.password + salt).toString(encBase64);

        const newUser = new User({
          email: req.fields.email,
          token: token,
          hash: hash,
          salt: salt,
          account: {
            username: req.fields.username,
          },
        });

        await newUser.save();
        res.status(200).json({
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(400).json({ message: "Missing parameters" });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const search = await User.findOne({ email: req.fields.email }); //look for account with this email
    if (search) {
      // if this email isn't used yet
      // if (req.fields.email && req.fields.password && req.fields.username) {
      const password1 = req.fields.password;
      const hash1 = SHA256(password1 + search.salt).toString(encBase64);
      //   const token1 = uid2(16);

      if (search.hash === hash1) {
        const infos = {
          id: search.id,
          token: search.token,
          account: {
            username: search.account.username,
          },
        };
        res.status(200).json(infos);
      } else {
        res.status(400).json({ message: "unauthorized 2" });
      }
      // }
    } else {
      res.status(400).json({ message: "unauthorized 1" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// -------------------- log-sign routes END -------------------- //

app.all("*", (req, res) => {
  res.send("Mauvaise URL");
});

app.listen(4000, () => {
  console.log("Server has started");
});
