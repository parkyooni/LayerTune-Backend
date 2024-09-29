const mongoose = require("mongoose");

const LayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  layout: {
    type: Array,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  googleUserId: {
    type: String,
    required: true,
  },
});

LayerSchema.index({ googleUserId: 1 });
LayerSchema.index({ url: 1 });

module.exports = mongoose.model("Layer", LayerSchema);
