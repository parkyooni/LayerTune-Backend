const express = require("express");
const router = express.Router();
const {
  getAllLayers,
  saveLayer,
  getLayersByUser,
  getLayerById,
  deleteLayer,
} = require("../controllers/layerController");

router.post("/save", saveLayer);
router.get("/layers", getAllLayers);
router.get("/user/:userId", getLayersByUser);
router.get("/layer/:id", getLayerById);
router.delete("/delete/:id", deleteLayer);

module.exports = router;
