const { Router } = require("express");

const authRouter = Router();

const authController = require("../controllers/authController");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

// Auth checks

function authCheck(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }

  next();
}

//GETs

authRouter.get("/log-in", authCheck, authController.getLogIn);
authRouter.get("/sign-up", authCheck, authController.getSignUp);

//POSTs

authRouter.post(
  "/log-in",
  [
    body("username").trim().notEmpty(),
    body("password").trim().notEmpty(),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/log-in",
  })
);

authRouter.post(
  "/sign-up",
  [
    body("username").trim().notEmpty().withMessage("username is required"),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("password is required to be min 6 chars"),
    body("confirmPassword").custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error("password does not match");
      }
      return true;
    }),
  ],
  authController.postSignUpUser
);

authRouter.post("/log-out", authController.postLogOut);

module.exports = authRouter;
