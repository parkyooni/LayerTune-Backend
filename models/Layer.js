const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const elementChangeSchema = new Schema({
  elementId: { type: String, required: true },
  newPosition: {
    parentId: { type: String, default: null },
    previousSiblingId: { type: String, default: null },
    newStyles: { type: [String], default: [] },
    XPath: { type: String, required: true },
  },
  originalPosition: {
    parentId: { type: String, default: null },
    previousSiblingId: { type: String, default: null },
    originalStyles: { type: [String], default: [] },
    XPath: { type: String, required: true },
  },
});

const domChangeSchema = new Schema({
  userId: { type: String, required: true },
  url: { type: String, required: true },
  customName: { type: String, required: true },
  modifiedDOMSnapshot: { type: Array, required: false },
  modifiedDOMSnapshotId: { type: Schema.Types.ObjectId, required: false },
  elementChanges: [elementChangeSchema],
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DOMChange", domChangeSchema);
