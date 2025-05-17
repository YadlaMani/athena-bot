const mongoose = require("mongoose");

const pointsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  points: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Points", pointsSchema);
