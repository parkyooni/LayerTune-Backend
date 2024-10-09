const DOMChange = require("../models/Layer");
const { sanitizeElementChanges } = require("../utils");

exports.saveDomChange = async (req, res, next) => {
  try {
    const { elementChanges, ...rest } = req.body;
    const sanitizedChanges = sanitizeElementChanges(elementChanges);

    const domChange = await DOMChange.create({
      ...rest,
      elementChanges: sanitizedChanges,
    });

    res.status(201).json(domChange);
  } catch (error) {
    next(error);
  }
};

exports.deleteDomChange = async (req, res, next) => {
  try {
    const deletedChange = await DOMChange.findByIdAndDelete(req.params.id);

    if (!deletedChange) {
      return res.status(404).json({ message: "DOM change not found" });
    }

    res.status(200).json({ message: "DOM change deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getDomChangesByGoogleId = async (req, res, next) => {
  try {
    const domChanges = await DOMChange.find({ userId: req.params.googleId });
    res.status(200).json(domChanges);
  } catch (error) {
    next(error);
  }
};

exports.getDomChangesByUrl = async (req, res, next) => {
  try {
    const { url } = req.params;
    const { userId } = req.query;

    const domChanges = await DOMChange.find({ url, userId });
    res.status(200).json(domChanges);
  } catch (error) {
    next(error);
  }
};

exports.checkExistingCustomName = async (req, res, next) => {
  try {
    const existingChange = await DOMChange.findOne({
      customName: req.params.customName,
    });

    res.status(200).json({ exists: !!existingChange });
  } catch (error) {
    next(error);
  }
};
