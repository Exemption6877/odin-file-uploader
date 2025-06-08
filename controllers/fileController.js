const db = require("../prisma/queries");

async function getMainPage(req, res) {
  res.render("index");
}

async function getHomePage(req, res) {
  try {
    const userId = req.user.id;
    const files = await db.getFilesByUserId(userId);
    console.log(files);
    res.render("home", { files: files });
  } catch (err) {
    console.log(err);
  }
}

async function postUpload(req, res) {
  try {
    const filename = req.file.originalname; // file will have unique name in storage, its name is separate
    const filepath = req.file.path;
    const userId = req.user.id;
    await db.addFile(filename, filepath, userId);

    res.redirect("/home");
  } catch (err) {
    console.log(err);
  }
}

module.exports = { getMainPage, getHomePage, postUpload };
