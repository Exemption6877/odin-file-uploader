const db = require("../prisma/queries");
const { unlink } = require("node:fs");
const { format } = require("date-fns");

// General
async function getMainPage(req, res) {
  res.render("index");
}

async function getHomePage(req, res) {
  try {
    const userId = req.user.id;
    const folders = await db.getFoldersByUserId(userId);
    const files = await db.getFilesByUserId(userId);
    res.render("home", { files: files, folders: folders, outputFolders: true });
  } catch (err) {
    console.log(err);
  }
}

// Folder-related
async function postAddFolder(req, res) {
  try {
    const folderTitle = req.body.folder;
    const userId = req.user.id;
    await db.addFolder(userId, folderTitle);
    res.redirect("/home");
  } catch (err) {
    console.log(err);
  }
}

async function postRenameFolder(req, res) {
  try {
    const userId = req.user.id;
    const folderId = Number(req.params.folderId);
    const foldername = req.body.renameFolder;
    await db.renameFolder(userId, folderId, foldername);
    res.redirect("/home");
  } catch (err) {
    console.log(err);
  }
}

async function postDeleteFolder(req, res) {
  try {
    const userId = req.user.id;
    const folderId = Number(req.params.folderId);
    const foldername = req.body.renameFolder;
    await db.deleteFolder(userId, folderId, foldername);
    res.redirect("/home");
  } catch (err) {
    console.log(err);
  }
}

async function getFilesByFolder(req, res) {
  try {
    const userId = req.user.id;
    const foldername = req.params.foldername;
    const folders = await db.getFoldersByUserId(userId);
    const files = await db.getFilesByFolder(userId, foldername);
    res.render("home", {
      files: files,
      folders: folders,
      outputFolders: false,
      foldername: foldername,
    });
  } catch (err) {
    console.log(err);
  }
}

// File-related
async function postUpload(req, res) {
  try {
    const now = new Date();
    const formattedDate = format(now, "dd-MM-yy_HH:mm:ss");
    const filename = formattedDate + `-` + req.file.originalname;
    const filepath = req.file.path;
    const filetype = req.file.mimetype;
    const userId = req.user.id;
    const date = new Date();
    const foldername = req.params.foldername;

    if (foldername) {
      await db.addFile(filename, filetype, filepath, userId, date, foldername);
      res.redirect(`/folder/${foldername}`);
    } else {
      await db.addFile(filename, filetype, filepath, userId, date);
      res.redirect("/home");
    }
  } catch (err) {
    console.log(err);
  }
}

async function postDeleteFile(req, res) {
  try {
    const userId = req.user.id;
    const fileId = Number(req.params.fileId);
    const file = await db.getFile(userId, fileId);

    unlink(`${file.path}`, (err) => {
      if (err) console.log(err);
    });

    await db.deleteFile(userId, fileId);
    const foldername = req.query.foldername;

    if (foldername) {
      res.redirect(`/folder/${foldername}`);
    } else {
      res.redirect("/home");
    }
  } catch (err) {
    console.log(err);
  }
}

async function postRenameFile(req, res) {
  try {
    const userId = req.user.id;
    const fileId = Number(req.params.fileId);
    const filename = req.body.renameFile;
    const foldername = req.query.foldername;

    await db.renameFile(userId, fileId, filename);

    if (foldername) {
      res.redirect(`/folder/${foldername}`);
    } else {
      res.redirect("/home");
    }
  } catch (err) {
    console.log(err);
  }
}

async function postFiletoFolder(req, res) {
  try {
    const userId = req.user.id;
    const folderId = Number(req.body.moveFolder);
    const fileId = Number(req.params.fileId);

    if (folderId === NaN || folderId === null) {
      await db.addFiletoFolder(userId, null, fileId);
    }
    await db.addFiletoFolder(userId, folderId, fileId);

    const foldername = req.query.foldername;

    if (foldername) {
      res.redirect(`/folder/${foldername}`);
    } else {
      res.redirect("/home");
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  getMainPage,
  getHomePage,
  // Folder
  postAddFolder,
  postRenameFolder,
  postDeleteFolder,
  getFilesByFolder,
  // File
  postUpload,
  postDeleteFile,
  postRenameFile,
  postFiletoFolder,
};
