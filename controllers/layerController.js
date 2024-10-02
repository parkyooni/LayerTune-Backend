const Layer = require("../models/Layer");

const normalizeUrl = (url) => {
  const normalizedUrl = new URL(url);
  normalizedUrl.hash = "";
  normalizedUrl.search = "";
  return normalizedUrl.href.replace(/\/$/, "");
};

exports.saveLayer = async (req, res) => {
  const { name, url, userId, changes, originalDOM, modifiedDOM } = req.body;

  if (!url || !userId || !changes || changes.length === 0) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields. URL, userId, and changes are required.",
    });
  }

  try {
    const newLayer = new Layer({
      name,
      url: normalizeUrl(url),
      userId,
      changes: changes.map((change) => ({
        ...change,
        selector: change.selector,
        selectorType: change.selectorType,
        changeType: change.changeType,
        contentType: change.contentType,
        originalContent: change.originalContent,
        newContent: change.newContent,
        attributes: change.attributes,
        styles: change.styles,
      })),
    });

    if (originalDOM) {
      newLayer.saveStructureSnapshot(originalDOM);
    }
    if (modifiedDOM) {
      newLayer.saveModifiedDOM(modifiedDOM);
    }

    const savedLayer = await newLayer.save();
    res.status(201).json({ success: true, layer: savedLayer });
  } catch (error) {
    console.error("Error saving layer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLayersByUser = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [layers, total] = await Promise.all([
      Layer.find({ userId: req.params.userId })
        .skip(skip)
        .limit(limit)
        .sort({ lastModified: -1 })
        .lean(),
      Layer.countDocuments({ userId: req.params.userId }),
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
      return res
        .status(404)
        .json({ success: false, message: "Layer not found" });
    }

    const responseLayer = layer.toObject();

    if (layer.structureSnapshot) {
      responseLayer.structureSnapshot = layer.getStructureSnapshot();
    }
    if (layer.modifiedDOM) {
      responseLayer.modifiedDOM = layer.getModifiedDOM();
    }

    responseLayer.changes = Array.isArray(responseLayer.changes)
      ? responseLayer.changes
      : Object.values(responseLayer.changes || {});

    try {
      const jsonResponse = JSON.stringify({
        success: true,
        layer: responseLayer,
      });
      res.status(200).json(JSON.parse(jsonResponse));
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "JSON parsing error",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
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
