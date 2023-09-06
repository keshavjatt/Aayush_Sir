const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  },
});

const upload = multer({ storage: storage });

router.post("/login", uploadController.login);

router.post("/upload", upload.array("file"), uploadController.uploadCSVFiles);
// router.get("/getall", uploadController.getAll);

router.post('/postbank',uploadController.postbank)
router.get('/getbank',uploadController.getBank)
router.post('/postaccount',uploadController.postaccount)

router.get('/getaccount/:bankId',uploadController.getsingleaccount)
router.get('/getaccount',uploadController.getaccount)

module.exports = router;
