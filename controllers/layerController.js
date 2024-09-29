const Layer = require("../models/Layer");

const normalizeUrl = (url) => {
  const normalizedUrl = new URL(url);
  normalizedUrl.hash = "";
  normalizedUrl.search = "";
  return normalizedUrl.href.replace(/\/$/, "");
};

exports.saveLayer = async (req, res) => {
  const { name, layout, url, googleUserId } = req.body;

  // 필수 값들이 존재하는지 검증
  if (!name || !layout || layout.length === 0 || !url || !googleUserId) {
    console.error("Missing required fields: ", {
      name,
      layout,
      url,
      googleUserId,
    });
    return res.status(400).json({
      message:
        "Missing required fields. Name, layout, URL, and Google User ID are required.",
    });
  }

  try {
    const newLayer = new Layer({
      name,
      layout,
      url: normalizeUrl(url),
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
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getAllLayers = async (req, res) => {
  try {
    const layers = await Layer.find().lean();
    res.status(200).json(layers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getLayerById = async (req, res) => {
  try {
    const layer = await Layer.findById(req.params.id);
    if (!layer) {
      return res.status(404).json({ message: "Layer not found" });
    }

    res.status(200).json(layer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
