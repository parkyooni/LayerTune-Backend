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
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.getAllLayers = async (req, res) => {
  try {
    const layers = await Layer.find();
    res.status(200).json(layers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.getLayersByUser = async (req, res) => {
  try {
    const layers = await Layer.find({ googleUserId: req.params.googleUserId });
    res.status(200).json(layers);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error,
    });
  }
};
