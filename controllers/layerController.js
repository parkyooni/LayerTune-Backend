const Layer = require("../models/Layer");
const zlib = require("zlib");
const util = require("util");

const inflate = util.promisify(zlib.inflate);
const deflate = util.promisify(zlib.deflate);

const normalizeUrl = (url) => {
  const normalizedUrl = new URL(url);
  normalizedUrl.hash = "";
  normalizedUrl.search = "";
  return normalizedUrl.href.replace(/\/$/, "");
};

exports.saveLayer = async (req, res) => {
  const { name, layout, url, googleUserId } = req.body;

  try {
    const normalizedUrl = normalizeUrl(url);
    console.log("Original layout before compression:", layout);
    const compressedLayout = await deflate(JSON.stringify(layout));
    console.log("Compressed layout:", compressedLayout);
    const newLayer = new Layer({
      name,
      layout: compressedLayout,
      url: normalizedUrl,
      googleUserId,
    });
    const savedLayer = await newLayer.save();
    res.status(201).json(savedLayer);
  } catch (error) {
    console.error("Error saving layer:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getLayersByUser = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [layers, total] = await Promise.all([
      Layer.find({ googleUserId: req.params.googleUserId })
        .select("-layout")
        .skip(skip)
        .limit(limit)
        .sort({ timestamp: -1 })
        .lean(),
      Layer.countDocuments({ googleUserId: req.params.googleUserId }),
    ]);

    res.status(200).json({
      layers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.error("Error fetching layers for user:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getLayerById = async (req, res) => {
  try {
    const layer = await Layer.findById(req.params.id);
    if (!layer) {
      return res.status(404).json({ message: "Layer not found" });
    }

    console.log("Retrieved compressed layout:", layer.layout);

    let decompressedLayout;
    if (Buffer.isBuffer(layer.layout)) {
      try {
        decompressedLayout = await inflate(layer.layout);
        console.log("Decompressed layout:", decompressedLayout);
      } catch (decompressError) {
        console.error("Error decompressing layout:", decompressError);
        return res.status(500).json({
          message: "Error decompressing layout",
          error: decompressError.message,
        });
      }
    }

    const parsedLayout = JSON.parse(decompressedLayout.toString());
    res.json({ ...layer.toObject(), layout: parsedLayout });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllLayers = async (req, res) => {
  try {
    const layers = await Layer.find().select("-layout").lean();
    res.status(200).json(layers);
  } catch (error) {
    console.error("Error fetching all layers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.deleteLayer = async (req, res) => {
  try {
    const deletedLayer = await Layer.findByIdAndDelete(req.params.id);
    if (!deletedLayer) {
      return res.status(404).json({ message: "Layer not found" });
    }
    res
      .status(200)
      .json({ message: "Layer deleted successfully", deletedLayer });
  } catch (error) {
    console.error("Error deleting layer:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
