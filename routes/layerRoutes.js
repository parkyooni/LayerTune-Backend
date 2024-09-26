const express = require("express");
const router = express.Router();
const {
  saveLayer,
  getAllLayers,
  getLayersByUser,
  deleteLayer,
} = require("../controllers/layerController");

router.post("/save", saveLayer);
router.get("/layers", getAllLayers);
router.get("/:googleUserId", getLayersByUser);
router.delete("/delete/:id", deleteLayer);

module.exports = router;
