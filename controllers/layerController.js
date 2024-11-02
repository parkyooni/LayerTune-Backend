const DOMChange = require("../models/Layer");
const { sanitizeElementChanges } = require("../utils");

const handleError = (error, next) => {
  console.error(error);
  next(error);
};

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
    handleError(error, next);
  }
};

exports.deleteDomChange = async (req, res, next) => {
  try {
    const deletedChange = await DOMChange.findByIdAndDelete(req.params.id);

    if (!deletedChange) {
      return res.status(404).json({ message: "DOM 변경을 찾을 수 없습니다" });
    }

    res.status(200).json({ message: "DOM 변경이 성공적으로 삭제되었습니다" });
  } catch (error) {
    handleError(error, next);
  }
};

exports.getDomChangesByGoogleId = async (req, res, next) => {
  try {
    const domChanges = await DOMChange.find({ userId: req.params.googleId });
    res.status(200).json(domChanges);
  } catch (error) {
    handleError(error, next);
  }
};

exports.getDomChangesByUrl = async (req, res, next) => {
  try {
    const { url } = req.params;
    const { userId } = req.query;

    const domChanges = await DOMChange.find({ url, userId });
    res.status(200).json(domChanges);
  } catch (error) {
    handleError(error, next);
  }
};

exports.checkExistingCustomName = async (req, res, next) => {
  try {
    const existingChange = await DOMChange.findOne({
      customName: req.params.customName,
    });

    res.status(200).json({ exists: !!existingChange });
  } catch (error) {
    handleError(error, next);
  }
};
