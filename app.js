const path = require("node:path");
const express = require("express");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

require("dotenv").config();

const PORT = process.env.PORT || 3000;

// Session handlers

const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const db = require("./prisma/queries");
const bcrypt = require("bcryptjs");

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db.getUserByName(username);

      if (!user) {
        return done(null, false, { message: "Incorrect credentials" });
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return done(null, false, { message: "Incorrect credentials" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.getUserById(id);

    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;
  next();
});

// Routers
const authRouter = require("./routers/authRouter");
const fileRouter = require("./routers/fileRouter");

app.use("/", authRouter);
app.use("/", fileRouter);

// Server

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
