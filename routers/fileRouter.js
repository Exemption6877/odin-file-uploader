const { Router } = require("express");

const fileRouter = Router();

fileRouter.get("/", async (req, res) => {
  res.render("index");
});

fileRouter.get("/home", (req, res) => {
  res.render("home", {
    isAuthenticated: true,
    testArr: ["1.txt", "2.pdf", "what.file"],
  });
});

module.exports = fileRouter;
