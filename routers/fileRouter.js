const { Router } = require("express");

const fileRouter = Router();
const fileController = require("../controllers/fileController");

// Multer

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

// Custom middlewares

function authCheck(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  next();
}

// GETs

fileRouter.get("/", fileController.getMainPage);
fileRouter.get("/home", authCheck, fileController.getHomePage);

fileRouter.get(
  "/folder/:foldername",
  authCheck,
  fileController.getFilesByFolder
);
fileRouter.get(
  "/file/:fileId/details",
  authCheck,
  fileController.getFileDetails
);

fileRouter.get("/folder/share/:uuid", fileController.getShareFolder);

fileRouter.get(
  "/folder/share/:uuid/file/:fileId/details",
  fileController.getShareDetails
);

// POSTs

// file
fileRouter.post(
  "/create/file",
  upload.single("file"),
  fileController.postUpload
);

fileRouter.post(
  "/create/file/:foldername",
  upload.single("file"),
  fileController.postUpload
);

fileRouter.post("/file/:fileId/edit", fileController.postRenameFile);
fileRouter.post("/file/:fileId/delete", fileController.postDeleteFile);
fileRouter.post("/file/:fileId/move", fileController.postFiletoFolder);

// folder
fileRouter.post("/create/folder", fileController.postAddFolder);
fileRouter.post("/folder/:folderId/edit", fileController.postRenameFolder);
fileRouter.post("/folder/:folderId/delete", fileController.postDeleteFolder);

// share
fileRouter.post("/folder/:folderId/share", fileController.postShareFolder);

module.exports = fileRouter;
