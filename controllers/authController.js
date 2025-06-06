const db = require("../prisma/queries");
const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");

const saltRounds = 10;

async function getLogIn(req, res) {
  res.render("auth", { method: "log-in" });
}

async function getSignUp(req, res) {
  res.render("auth", { method: "sign-up" });
}

async function postSignUpUser(req, res) {
  const { username, password } = req.body;

  try {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.createUser(username, hashedPassword);
    res.redirect("/log-in");
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function postLogOut(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
}

module.exports = {
  getLogIn,
  getSignUp,
  postSignUpUser,
  postLogOut,
};
