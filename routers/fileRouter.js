const { Router } = require("express");

const fileRouter = Router();
const fileController = require("../controllers/fileController");

const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

function authCheck(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  next();
}

// GETs

fileRouter.get("/", fileController.getMainPage);
fileRouter.get("/home", authCheck, fileController.getHomePage);

// POSTs

fileRouter.post("/addfile", upload.single("file"), fileController.postUpload);

module.exports = fileRouter;
