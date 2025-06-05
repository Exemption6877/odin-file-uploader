const { Router } = require("express");

const authRouter = Router();

const authController = require("../controllers/authController");
const { body } = require("express-validator");

authRouter.get("/log-in", authController.getLogIn);
authRouter.get("/sign-up", authController.getSignUp);

authRouter.post(
  "/log-in",
  [body("username").trim().notEmpty(), body("password").trim().notEmpty()],
  authController.postLoginUser
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

module.exports = authRouter;
