const express = require("express");
const router = express.Router();
const domChangeController = require("../controllers/layerController");

router.post("/save", domChangeController.saveDomChange);
router.delete("/delete/:id", domChangeController.deleteDomChange);
router.get("/google/:googleId", domChangeController.getDomChangesByGoogleId);
router.get("/url/:url", domChangeController.getDomChangesByUrl);
router.get("/check/:customName", domChangeController.checkExistingCustomName);

module.exports = router;
