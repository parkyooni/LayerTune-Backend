const express = require("express");
const router = express.Router();
const {
  saveLayer,
  getAllLayers,
  getLayersByUser,
} = require("../controllers/layerController");

router.post("/save", saveLayer);
router.get("/layers", getAllLayers);
router.get("/:googleUserId", getLayersByUser);

module.exports = router;
