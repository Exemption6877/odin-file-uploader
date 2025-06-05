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

async function postLoginUser(req, res) {
  const { username, password } = req.body;

  try {
    const user = await db.getUserByName(username);
    if (!user) {
      return res.status(401).json({ error: "Credentials are incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credentials are incorrect" });
    }

    res.redirect("/");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
}

module.exports = { getLogIn, getSignUp, postSignUpUser, postLoginUser };
