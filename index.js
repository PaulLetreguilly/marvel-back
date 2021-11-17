const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(formidable());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to my marvel api");
});

app.get("/characters", async (req, res) => {
  try {
    const response = await axios.get(
      "https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=bNK7btJOXDqp7a9P"
    );
    // console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/comics", async (req, res) => {
  try {
    const response = await axios.get(
      "https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=bNK7btJOXDqp7a9P"
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/comics/:id", async (req, res) => {
  try {
    // console.log(req.params.id);
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics/${req.params.id}/?apiKey=bNK7btJOXDqp7a9P`
    );
    // console.log(response.data.id);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  res.send("Mauvaise URL");
});

app.listen(4000, () => {
  console.log("Server has started");
});
