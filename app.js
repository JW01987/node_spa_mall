const express = require("express");
const app = express();
const port = 3000;
const connect = require("./schemas");
const cookieParser = require("cookie-parser");
const {
  authRouter,
  commentRouter,
  postRouter,
  usersRouter,
} = require("./routes");
connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api", [postRouter, commentRouter, usersRouter, authRouter]);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
