const db = require("../prisma/queries");
const { unlink } = require("node:fs");
const { format, addWeeks, addDays, addHours, isBefore } = require("date-fns");

const cloud = require("../supabase/queries");

function fileSize(size, prefferedType) {
  const KB = size / 1024;

  if (prefferedType === "Kb") {
    return `${KB.toFixed(2)} Kb`;
  }

  const MB = KB / 1024;

  if (prefferedType === "Mb") {
    return `${MB.toFixed(2)} Mb`;
  }
}

function filetype(typeExt) {
  const arr = [];
  for (let i = 0; i < typeExt.length - 1; i++) {
    if (typeExt[i] === "/") {
      break;
    }

    arr.push(typeExt[i]);
  }

  return arr.join("");
}

// General
async function getMainPage(req, res) {
  res.render("index");
}

async function getHomePage(req, res) {
  try {
    const userId = req.user.id;
    const folders = await db.getFoldersByUserId(userId);
    let files = await db.getFilesByUserId(userId);
    files = await Promise.all(
      files.map(async (file) => ({
        ...file,
        path: await cloud.getUrl(file.path),
        filetype: filetype(file.type),
      }))
    );
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
    let files = await db.getFilesByFolder(userId, foldername);
    files = await Promise.all(
      files.map(async (file) => ({
        ...file,
        path: await cloud.getUrl(file.path),
        filetype: filetype(file.type),
      }))
    );

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
    const safeOriginal = req.file.originalname.replace(/\s+/g, "_");
    const filename = `${formattedDate}-${safeOriginal}`;
    const filepath = req.file.path;
    const filetype = req.file.mimetype;
    const filesize = req.file.size;
    const userId = req.user.id;
    const date = new Date();
    const foldername = req.params.foldername;

    const { path } = await cloud.uploadFile(req.file);

    if (foldername) {
      await db.addFile(
        filename,
        filetype,
        filesize,
        path,
        userId,
        date,
        foldername
      );
      res.redirect(`/folder/${foldername}`);
    } else {
      await db.addFile(filename, filetype, filesize, path, userId, date);
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

    await cloud.deleteFile(file.path);

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

async function getFileDetails(req, res) {
  try {
    const userId = req.user.id;
    const fileId = Number(req.params.fileId);

    let file = await db.getFile(userId, fileId);
    file = {
      ...file,
      filetype: filetype(file.type),
      formattedDate: format(file.creationDate, "dd-MMMM-yy"),
      formattedTime: format(file.creationDate, "HH:mm:ss"),
      formattedSize: fileSize(file.size, "Mb"),
      path: await cloud.getUrl(file.path),
    };

    res.render("filedetails", { file: file, shared: false });
  } catch (err) {
    console.log(err);
  }
}

async function postShareFolder(req, res) {
  try {
    const userId = req.user.id;
    const folderId = Number(req.params.folderId);
    const now = new Date();
    const duration = req.body.duration;
    const uuid = crypto.randomUUID();

    let result;
    if (duration === "week") {
      result = addWeeks(now, 1);
    } else if (duration === "day") {
      result = addDays(now, 1);
    } else if (duration === "hour") {
      result = addHours(now, 1);
    }

    await db.addSharedFolder(userId, uuid, folderId, result);

    res.redirect(`/folder/share/${uuid}`);
  } catch (err) {
    console.log(err);
  }
}

async function getShareFolder(req, res) {
  try {
    const uuid = req.params.uuid;
    const shared = await db.getSharedFolder(uuid);
    if (!shared) {
      res.json("Link does not exist / expired");
    }

    shared.folder.files = Promise.all(
      shared.folder.files.map(async (file) => ({
        ...file,
        filetype: filetype(file.type),
        path: await cloud.getUrl(file.path),
      }))
    );

    const now = new Date();
    // const now = new Date("2025-06-15T12:00:00Z");

    if (isBefore(now, shared.expDate)) {
      res.render("home", {
        files: shared.folder.files,
        folders: shared.folder,
        foldername: shared.folder.title,
        shared: true,
        uuid: uuid,
      });
    } else {
      await db.deleteSharedFolder(uuid);
      res.json("Link does not exist / expired");
    }
  } catch (err) {
    console.log(err);
  }
}

async function getShareDetails(req, res) {
  try {
    const uuid = req.params.uuid;
    const fileId = Number(req.params.fileId);

    const shared = await db.getSharedFile(uuid, fileId);

    shared.folder.files = await Promise.all(
      shared.folder.files.map(async (file) => ({
        ...file,
        filetype: filetype(file.type),
        formattedDate: format(file.creationDate, "dd-MMMM-yy"),
        formattedTime: format(file.creationDate, "HH:mm:ss"),
        formattedSize: fileSize(file.size, "Mb"),
        path: await cloud.getUrl(file.path),
      }))
    );

    console.log(shared.folder.files[0]);
    res.render("filedetails", {
      file: shared.folder.files[0],
      shared: true,
      sharedFolder: shared.folder.title,
      uuid: uuid,
    });
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
  postShareFolder,
  getFilesByFolder,
  // File
  postUpload,
  postDeleteFile,
  postRenameFile,
  postFiletoFolder,
  getFileDetails,
  getShareFolder,
  getShareDetails,
};
