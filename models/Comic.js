const mongoose = require("mongoose");

const Comic = mongoose.model("Comic", {
  ownerToken: String,
  favorite: {
    title: String,
    description: String,
    comics: Array,
    thumbnail: { path: String, extension: String },
    id: String,
    liked: Boolean,
  },
});

module.exports = Comic;
