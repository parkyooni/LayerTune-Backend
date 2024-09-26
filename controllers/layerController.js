const Layer = require("../models/Layer");

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
    const newLayer = new Layer({
      name,
      layout,
      url: normalizedUrl,
      googleUserId,
    });
    const savedLayer = await newLayer.save();
    res.status(201).json(savedLayer);
  } catch (error) {
    console.error("Error saving layer:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.getAllLayers = async (req, res) => {
  try {
    const layers = await Layer.find();
    res.status(200).json(layers);
  } catch (error) {
    console.error("Error fetching all layers:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.getLayersByUser = async (req, res) => {
  try {
    const layers = await Layer.find({ googleUserId: req.params.googleUserId });
    res.status(200).json(layers);
  } catch (error) {
    console.error("Error fetching layers for user:", error);
    res.status(500).json({
      message: "Server Error",
      error,
    });
  }
};

exports.deleteLayer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLayer = await Layer.findByIdAndDelete(id);

    if (!deletedLayer) {
      return res.status(404).json({ message: "Layer not found" });
    }

    res
      .status(200)
      .json({ message: "Layer deleted successfully", deletedLayer });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error,
    });
  }
};
