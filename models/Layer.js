const mongoose = require("mongoose");
const zlib = require("zlib");

const ChangeSchema = new mongoose.Schema({
  selector: {
    type: String,
    required: true,
  },
  selectorType: {
    type: String,
    enum: ["xpath", "css", "custom"],
    required: true,
  },
  changeType: {
    type: String,
    enum: ["remove", "modify", "style"],
    required: true,
  },
  contentType: {
    type: String,
    enum: ["static", "dynamic"],
    required: true,
  },
  originalContent: String,
  newContent: String,
  attributes: {
    type: Map,
    of: String,
  },
  styles: {
    type: Map,
    of: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const LayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  changes: [ChangeSchema],
  structureSnapshot: {
    type: Buffer,
  },
  modifiedDOM: {
    type: Buffer,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

LayerSchema.index({ userId: 1, url: 1 });

LayerSchema.methods.saveStructureSnapshot = function (structure) {
  this.structureSnapshot = zlib.gzipSync(
    Buffer.from(JSON.stringify(structure))
  );
};

LayerSchema.methods.saveModifiedDOM = function (modifiedDOM) {
  this.modifiedDOM = zlib.gzipSync(Buffer.from(JSON.stringify(modifiedDOM)));
};

LayerSchema.methods.getStructureSnapshot = function () {
  if (!this.structureSnapshot) {
    return null;
  }
  return JSON.parse(zlib.gunzipSync(this.structureSnapshot).toString());
};

LayerSchema.methods.getModifiedDOM = function () {
  if (!this.modifiedDOM) {
    return null;
  }
  return JSON.parse(zlib.gunzipSync(this.modifiedDOM).toString());
};

module.exports = mongoose.model("Layer", LayerSchema);
