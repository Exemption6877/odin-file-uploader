const { Router } = require("express");

const authRouter = Router();

authRouter.get("/log-in", (req, res) => {
  res.send("test");
});

module.exports = authRouter;
