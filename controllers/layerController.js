const DOMChange = require("../models/Layer");
const {
  saveSnapshotsIfLarge,
  getSnapshotFromGridFS,
} = require("../utils/gridfsHelpers");

exports.saveDomChange = async (req, res, next) => {
  try {
    const { url, customName, modifiedDOMSnapshot, elementChanges, userId } =
      req.body;

    console.log("Received elementChanges: ", elementChanges);

    const sanitizeData = (data) => {
      if (typeof data === "object" && data !== null) {
        Object.keys(data).forEach((key) => {
          if (data[key] === "" || data[key] === undefined) {
            data[key] = null;
          } else if (typeof data[key] === "object") {
            sanitizeData(data[key]);
          }
        });
      }
      return data;
    };

    const sanitizedElementChanges = elementChanges.map((change) =>
      sanitizeData(change)
    );

    const domChange = new DOMChange({
      url,
      customName,
      modifiedDOMSnapshot,
      elementChanges: sanitizedElementChanges,
      userId,
    });

    await saveSnapshotsIfLarge(domChange);

    await domChange.save();

    const response = {
      ...domChange.toObject(),
      modifiedDOMSnapshot: domChange.modifiedDOMSnapshotId
        ? "Stored in GridFS"
        : domChange.modifiedDOMSnapshot,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in saveDomChange:", error);
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

    const domChangesWithSnapshots = await Promise.all(
      domChanges.map(async (change) => {
        const changeObj = change.toObject();
        if (changeObj.modifiedDOMSnapshotId) {
          changeObj.modifiedDOMSnapshot = await getSnapshotFromGridFS(
            changeObj.modifiedDOMSnapshotId
          );
        }
        return changeObj;
      })
    );

    res.status(200).json(domChangesWithSnapshots);
  } catch (error) {
    console.error("Error in getDomChangesByGoogleId:", error);
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
