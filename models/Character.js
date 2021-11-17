const mongoose = require("mongoose");

const Character = mongoose.model("Character", {
  name: String,
  description: String,
  comics: Array,
  thumbnail: { path: String, extension: String },
  id: String,
});

module.exports = Character;
