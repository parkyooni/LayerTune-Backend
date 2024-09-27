const mongoose = require("mongoose");
const zlib = require("zlib");
const { promisify } = require("util");

const deflateAsync = promisify(zlib.deflate);
const inflateAsync = promisify(zlib.inflate);

const LayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  layout: {
    type: Buffer,
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

LayerSchema.pre("save", async function (next) {
  if (this.isModified("layout")) {
    try {
      const layoutString = JSON.stringify(this.layout);
      this.layout = await deflateAsync(layoutString);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

LayerSchema.methods.getDecompressedLayout = async function () {
  if (this.layout) {
    try {
      const decompressed = await inflateAsync(this.layout);
      return JSON.parse(decompressed.toString());
    } catch (error) {
      console.error("Error decompressing layout:", error);
      throw new Error("Failed to decompress layout");
    }
  }
  return null;
};

LayerSchema.index({ googleUserId: 1 });
LayerSchema.index({ url: 1 });

module.exports = mongoose.model("Layer", LayerSchema);
