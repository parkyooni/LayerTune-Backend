const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const elementChangeSchema = new Schema({
  elementId: { type: String, required: true },
  initialElementId: { type: String, required: true },
  elementXPath: { type: String, required: true },
  updatedAttributes: { type: Map, of: String },
  updatedStyles: { type: Map, of: String },
});

const domChangeSchema = new Schema({
  userId: { type: String, required: true },
  url: { type: String, required: true },
  customName: { type: String, required: true },
  elementChanges: [elementChangeSchema],
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DOMChange", domChangeSchema);
