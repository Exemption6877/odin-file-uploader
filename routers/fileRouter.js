const { Router } = require("express");

const fileRouter = Router();

function authCheck(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  next();
}

fileRouter.get("/", async (req, res) => {
  res.render("index");
});

fileRouter.get("/home", authCheck, (req, res) => {
  res.render("home", {
    isAuthenticated: true,
    testArr: ["1.txt", "2.pdf", "what.file"],
  });
});

module.exports = fileRouter;
