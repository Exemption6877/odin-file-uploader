const path = require("node:path");
const express = require("express");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

require("dotenv").config();

const PORT = process.env.PORT || 3000;

// Routers
const authRouter = require("./routers/authRouter");
const fileRouter = require("./routers/fileRouter");

app.use("/", authRouter);
app.use("/", fileRouter);

// Server

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
