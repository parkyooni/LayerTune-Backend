const DOMChange = require("../models/Layer");

exports.saveDomChange = async (req, res, next) => {
  try {
    const {
      url,
      customName,
      originalDOMSnapshot,
      modifiedDOMSnapshot,
      elementChanges,
      userId,
    } = req.body;

    console.log("Received elementChanges: ", elementChanges);

    elementChanges.forEach((change) => {
      change.attributesChanged = filterDynamicAttributes(
        change.attributesChanged
      );
    });

    const domChange = new DOMChange({
      url,
      customName,
      originalDOMSnapshot,
      modifiedDOMSnapshot,
      elementChanges,
      userId,
    });

    await domChange.save();

    res.status(201).json(domChange);
  } catch (error) {
    next(error);
  }
};

exports.deleteDomChange = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedDomChange = await DOMChange.findByIdAndDelete(id);
    if (!deletedDomChange) {
      return res.status(404).json({ message: "DOM change not found" });
    }

    res.status(200).json({ message: "DOM change deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getDomChangesByGoogleId = async (req, res, next) => {
  try {
    const { googleId } = req.params;

    const domChanges = await DOMChange.find({ userId: googleId });
    if (domChanges.length === 0) {
      return res
        .status(404)
        .json({ message: "No DOM changes found for this Google ID" });
    }

    res.status(200).json(domChanges);
  } catch (error) {
    next(error);
  }
};

exports.getDomChangesByUrl = async (req, res, next) => {
  try {
    const { url } = req.params;

    const domChanges = await DOMChange.find({ url });
    if (domChanges.length === 0) {
      return res
        .status(404)
        .json({ message: "No DOM changes found for this URL" });
    }

    res.status(200).json(domChanges);
  } catch (error) {
    next(error);
  }
};

function filterDynamicAttributes(attributes) {
  const dynamicAttributes = ["timestamp", "session-id", "counter"];
  return attributes.filter(
    (attr) => !dynamicAttributes.includes(attr.attributeName)
  );
}

exports.checkExistingCustomName = async (req, res, next) => {
  try {
    const { customName } = req.params;
    const existingDomChange = await DOMChange.findOne({ customName });

    if (existingDomChange) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    next(error);
  }
};
